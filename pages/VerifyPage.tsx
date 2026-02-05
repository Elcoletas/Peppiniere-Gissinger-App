import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { db } from '../services/mockDb';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { Button } from '../components/Button';

export const VerifyPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }

        const verify = async () => {
            try {
                const success = await db.verifyUser(token);
                setStatus(success ? 'success' : 'error');
            } catch (e) {
                setStatus('error');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader size={48} className="text-emerald-600 animate-spin mb-4" />
                        <h2 className="text-xl font-bold text-slate-800">Vérification en cours...</h2>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center animate-fade-in">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Compte Vérifié !</h2>
                        <p className="text-slate-600 mb-6">Votre email a été confirmé avec succès. Vous pouvez maintenant vous connecter.</p>
                        <Button onClick={() => navigate('/')} className="w-full">
                            Retour à l'accueil
                        </Button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center animate-fade-in">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                            <XCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Lien invalide</h2>
                        <p className="text-slate-600 mb-6">Ce lien de vérification est invalide ou a déjà été utilisé.</p>
                        <Button variant="secondary" onClick={() => navigate('/')} className="w-full">
                            Retour à l'accueil
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};