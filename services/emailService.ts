import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG, APP_CONFIG } from '../config';

// Initialize EmailJS
try {
    if (EMAIL_CONFIG.PUBLIC_KEY && EMAIL_CONFIG.PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
        emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);
    }
} catch (e) {
    console.warn("EmailJS init failed:", e);
}

interface EmailParams {
    to_email: string;
    to_name: string;
    subject: string;
    message: string;
    date?: string;
    time?: string;
    status?: string;
    link?: string; // Added for verification links
}

export const emailService = {
    /**
     * Generic send function
     */
    send: async (params: EmailParams) => {
        // If config is not set, log to console (Dev Mode)
        if (!EMAIL_CONFIG.SERVICE_ID || EMAIL_CONFIG.SERVICE_ID === "YOUR_SERVICE_ID") {
            console.log(`[SIMULATION EMAIL] 
            To: ${params.to_email}
            Subject: ${params.subject}
            Message: ${params.message}
            Link: ${params.link || 'N/A'}
            -----------------------------`);
            return true;
        }

        try {
            // Mapping params to what EmailJS expects in the template
            const templateParams = {
                to_email: params.to_email,
                to_name: params.to_name,
                subject: params.subject,
                message: params.message,
                action_link: params.link || '', // Make sure your EmailJS template has {{action_link}}
                appointment_date: params.date || '',
                appointment_time: params.time || '',
                appointment_status: params.status || '',
                company_name: APP_CONFIG.COMPANY_NAME,
                company_email: APP_CONFIG.COMPANY_EMAIL
            };

            const response = await emailjs.send(
                EMAIL_CONFIG.SERVICE_ID,
                EMAIL_CONFIG.TEMPLATE_ID,
                templateParams
            );
            
            console.log("Email sent successfully!", response.status, response.text);
            return true;
        } catch (error) {
            console.error("Failed to send email:", error);
            return false;
        }
    },

    /**
     * Sent when a user registers - Now includes Verification Link
     */
    sendVerification: async (email: string, name: string, token: string) => {
        // Construct the link based on current domain (works for localhost and hostinger)
        const baseUrl = window.location.origin + window.location.pathname;
        // HashRouter syntax: domain.com/#/verify?token=xyz
        const verificationLink = `${baseUrl}#/verify?token=${token}`;

        return emailService.send({
            to_email: email,
            to_name: name,
            subject: `Vérifiez votre compte - ${APP_CONFIG.COMPANY_NAME}`,
            message: `Merci de vous être inscrit. Veuillez cliquer sur le lien ci-dessous pour activer votre compte et commencer à réserver.`,
            link: verificationLink
        });
    },

    /**
     * Fallback for Welcome (if no token)
     */
    sendWelcome: async (email: string, name: string) => {
        return emailService.send({
            to_email: email,
            to_name: name,
            subject: `Bienvenue chez ${APP_CONFIG.COMPANY_NAME}`,
            message: `Votre compte a été créé avec succès.`
        });
    },

    /**
     * Sent to CLIENT when they book
     */
    sendBookingConfirmation: async (email: string, name: string, date: string, time: string, reason: string) => {
        return emailService.send({
            to_email: email,
            to_name: name,
            date,
            time,
            subject: `Confirmation de rendez-vous - ${date}`,
            message: `Votre demande de rendez-vous pour "${reason}" a été enregistrée. Un artisan validera votre créneau sous peu.`
        });
    },

    /**
     * Sent to ADMIN when a client books
     */
    sendAdminNotification: async (clientName: string, date: string, time: string, reason: string, clientPhone?: string) => {
        return emailService.send({
            to_email: APP_CONFIG.COMPANY_EMAIL,
            to_name: "Administrateur",
            date,
            time,
            subject: `NOUVEAU RDV: ${clientName}`,
            message: `Nouveau rendez-vous demandé.\nClient: ${clientName}\nTél: ${clientPhone || 'Non renseigné'}\nMotif: ${reason}`
        });
    },

    /**
     * Sent to CLIENT when status changes (Cancelled, Confirmed, etc.)
     */
    sendStatusUpdate: async (email: string, name: string, date: string, time: string, status: string, notes?: string) => {
        let statusMessage = "";
        switch(status) {
            case 'CONFIRMED': statusMessage = "Votre rendez-vous est CONFIRMÉ."; break;
            case 'CANCELLED': statusMessage = "Votre rendez-vous a été ANNULÉ."; break;
            case 'RESCHEDULED_PENDING': statusMessage = "Une modification d'horaire est proposée."; break;
            default: statusMessage = `Le statut est maintenant : ${status}`;
        }

        return emailService.send({
            to_email: email,
            to_name: name,
            date,
            time,
            status,
            subject: `Mise à jour de votre rendez-vous`,
            message: `${statusMessage}\n${notes ? 'Note: ' + notes : ''}`
        });
    },

    /**
     * Sent to ADMIN when Client cancels
     */
    sendCancellationToAdmin: async (clientName: string, date: string, time: string, reason: string) => {
        return emailService.send({
            to_email: APP_CONFIG.COMPANY_EMAIL,
            to_name: "Administrateur",
            date,
            time,
            subject: `ANNULATION RDV: ${clientName}`,
            message: `Le client ${clientName} a annulé son rendez-vous du ${date} à ${time}.\nMotif: ${reason}`
        });
    }
};