import React, { useEffect } from 'react';
import { ArrowLeft, Shield, FileText, Lock, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../config';

const LegalLayout: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-800 mb-6 transition font-medium">
          <ArrowLeft size={20} className="mr-2" /> Retour à l'accueil
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-emerald-600 p-8 text-white flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              {icon}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
          </div>
          
          <div className="p-8 md:p-12 text-slate-700 leading-relaxed space-y-8 text-justify">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export const MentionsLegales: React.FC = () => {
  return (
    <LegalLayout title="Mentions Légales" icon={<Shield size={32} />}>
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">1. Édition du site</h2>
        <p>
          En vertu de l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, il est précisé aux utilisateurs du site internet <strong>{APP_CONFIG.COMPANY_NAME}</strong> l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi :
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 bg-slate-50 p-4 rounded-lg text-sm border border-slate-100">
          <li><strong>Propriétaire du site :</strong> {APP_CONFIG.COMPANY_NAME} - Entreprise Individuelle</li>
          <li><strong>Adresse :</strong> {APP_CONFIG.COMPANY_ADDRESS}</li>
          <li><strong>Contact :</strong> {APP_CONFIG.COMPANY_EMAIL} | {APP_CONFIG.COMPANY_PHONE}</li>
          <li><strong>Directeur de la publication :</strong> Jean Gissinger</li>
          <li><strong>Hébergeur :</strong> Hostinger International Ltd., 61 Lordou Vironos Street, 6023 Larnaca, Chypre.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">2. Propriété intellectuelle et contrefaçons</h2>
        <p>
          <strong>{APP_CONFIG.COMPANY_NAME}</strong> est propriétaire des droits de propriété intellectuelle et détient les droits d’usage sur tous les éléments accessibles sur le site internet, notamment les textes, images, graphismes, logos, vidéos, architecture, icônes et sons.
        </p>
        <p className="mt-4">
          Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de <strong>{APP_CONFIG.COMPANY_NAME}</strong>.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">3. Limitations de responsabilité</h2>
        <p>
          <strong>{APP_CONFIG.COMPANY_NAME}</strong> ne pourra être tenu pour responsable des dommages directs et indirects causés au matériel de l’utilisateur, lors de l’accès au site.
        </p>
        <p className="mt-4">
          <strong>{APP_CONFIG.COMPANY_NAME}</strong> décline toute responsabilité quant à l’utilisation qui pourrait être faite des informations et contenus présents sur le site.
        </p>
      </section>
    </LegalLayout>
  );
};

export const CGU: React.FC = () => {
  return (
    <LegalLayout title="Conditions Générales d'Utilisation" icon={<FileText size={32} />}>
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">1. Objet</h2>
        <p>
          Les présentes Conditions Générales d'Utilisation (ci-après "CGU") ont pour objet de définir les modalités de mise à disposition des services du site <strong>{APP_CONFIG.COMPANY_NAME}</strong> et les conditions d'utilisation du Service par l'Utilisateur.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">2. Services Disponibles</h2>
        <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Consulter les informations sur la pépinière et ses produits.</li>
            <li>Créer un compte personnel sécurisé.</li>
            <li>Prendre rendez-vous en ligne pour des services de conseil ou d'achat.</li>
            <li>Gérer l'historique de leurs rendez-vous.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">3. Politique de Rendez-vous</h2>
        <div className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <h3 className="font-bold text-amber-800 mb-2">Annulation et Modification</h3>
                <p className="text-sm">
                    L'utilisateur s'engage à honorer ses rendez-vous. En cas d'empêchement, il doit annuler ou modifier sa réservation via son espace personnel au moins <strong>24 heures à l'avance</strong>.
                </p>
            </div>
            <p>
                L'entreprise se réserve le droit de suspendre l'accès au service de réservation en ligne à tout utilisateur présentant un taux d'absentéisme élevé non justifié.
            </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">4. Droit applicable</h2>
        <p>
          La législation française s'applique au présent contrat. En cas d'absence de résolution amiable d'un litige né entre les parties, les tribunaux français seront seuls compétents pour en connaître.
        </p>
      </section>
    </LegalLayout>
  );
};

export const PolitiqueConfidentialite: React.FC = () => {
    return (
        <LegalLayout title="Politique de Confidentialité" icon={<Lock size={32} />}>
            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">1. Collecte des données</h2>
                <p>
                    Dans le cadre de l'utilisation de notre service de prise de rendez-vous, nous sommes amenés à collecter les données personnelles suivantes :
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 bg-slate-50 p-4 rounded-lg">
                    <li>Nom et Prénom</li>
                    <li>Adresse email (pour les confirmations et notifications)</li>
                    <li>Numéro de téléphone (pour vous contacter en cas d'imprévu)</li>
                    <li>Historique des rendez-vous</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">2. Utilisation des données</h2>
                <p>Vos données sont utilisées exclusivement pour :</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>La gestion de votre compte client.</li>
                    <li>La planification et le suivi de vos rendez-vous.</li>
                    <li>L'envoi d'informations importantes concernant la pépinière (horaires exceptionnels, fermetures).</li>
                </ul>
                <p className="mt-4 font-bold text-emerald-700">
                    Nous ne revendons jamais vos données à des tiers publicitaires.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">3. Conservation et Sécurité</h2>
                <p>
                    Vos données sont conservées sur des serveurs sécurisés en Europe. Elles sont conservées pendant une durée de 3 ans après votre dernier contact avec nous, conformément aux recommandations de la CNIL.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">4. Vos Droits (RGPD)</h2>
                <p>
                    Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données.
                </p>
                <p className="mt-2">
                    Pour exercer ces droits, contactez-nous simplement à : <a href={`mailto:${APP_CONFIG.COMPANY_EMAIL}`} className="text-emerald-600 underline font-bold">{APP_CONFIG.COMPANY_EMAIL}</a>.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">5. Cookies</h2>
                <div className="flex items-start gap-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <Cookie className="shrink-0 text-blue-500" size={24} />
                    <p className="text-sm text-blue-800">
                        Ce site utilise uniquement des cookies techniques essentiels au fonctionnement de l'espace membre (session). Nous n'utilisons pas de traceurs publicitaires ou de cookies tiers intrusifs.
                    </p>
                </div>
            </section>
        </LegalLayout>
    );
};