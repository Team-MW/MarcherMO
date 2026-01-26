import { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const translations = {
    fr: {
        home: {
            title: "Marché MO 🥩",
            subtitle: "Boucherie Traditionnelle & Moderne",
            instruction_title: "Prenez votre ticket 🎫",
            instruction_desc: "Réservez votre place dans la file d'attente depuis votre mobile. Plus besoin d'attendre debout !",
            phone_label: "Votre numéro de téléphone",
            submit_btn: "Prendre un ticket",
            notification_text: "👋 Nous vous enverrons un SMS quand ce sera votre tour.",
            placeholder: "+33 6 12 34 56 78"
        },
        status: {
            title_waiting: "Votre ticket est confirmé ✅",
            subtitle_waiting: "Détendez-vous, on s'occupe de tout.",
            ticket_label: "Votre Numéro",
            position_label: "Personnes devant vous",
            next_label: "Vous êtes le prochain !",
            realtime_label: "Actualisation en temps réel",
            sms_info_title: "📱 Notification SMS active",
            sms_info_desc: "Vous recevrez un SMS quand ce sera votre tour. Vous pouvez vaquer à vos occupations.",
            title_called: "C'est à vous ! 🎉",
            subtitle_called: "Le boucher vous attend au comptoir.",
            called_confirmation: "C'est votre tour",
            review_title: "Votre avis nous fait plaisir !",
            review_btn: "Donner mon avis sur Google",
            location: "Marché de Mo' - Toulouse",
            soon: "Bientôt !",
            persons_ahead: "personnes"
        }
    },
    en: {
        home: {
            title: "Marché MO 🥩",
            subtitle: "Traditional & Modern Butchery",
            instruction_title: "Get your ticket 🎫",
            instruction_desc: "Reserve your spot in the queue from your phone. No need to stand and wait!",
            phone_label: "Your phone number",
            submit_btn: "Get a ticket",
            notification_text: "👋 We will send you an SMS when it's your turn.",
            placeholder: "+33 6 12 34 56 78"
        },
        status: {
            title_waiting: "Ticket confirmed ✅",
            subtitle_waiting: "Relax, we'll take care of everything.",
            ticket_label: "Your Number",
            position_label: "People ahead of you",
            next_label: "You are next!",
            realtime_label: "Real-time update",
            sms_info_title: "📱 SMS Notification active",
            sms_info_desc: "You will receive an SMS when it's your turn. Feel free to wait comfortably.",
            title_called: "It's your turn! 🎉",
            subtitle_called: "The butcher is waiting for you at the counter.",
            called_confirmation: "It's your turn",
            review_title: "We value your feedback!",
            review_btn: "Rate us on Google",
            location: "Marché de Mo' - Toulouse",
            soon: "Soon!",
            persons_ahead: "people"
        }
    },
    ar: {
        home: {
            title: "سوق مو 🥩",
            subtitle: "جزارة تقليدية وعصرية",
            instruction_title: "خذ تذكرتك 🎫",
            instruction_desc: "احجز دورك في الطابور من هاتفك. لا داعي للانتظار واقفاً!",
            phone_label: "رقم هاتفك",
            submit_btn: "احصل على تذكرة",
            notification_text: "👋 سنرسل لك رسالة نصية عندما يحين دورك.",
            placeholder: "+33 6 12 34 56 78"
        },
        status: {
            title_waiting: "تم تأكيد تذكرتك ✅",
            subtitle_waiting: "ارتح، سنهتم بكل شيء.",
            ticket_label: "رقمك",
            position_label: "أشخاص أمامك",
            next_label: "أنت التالي!",
            realtime_label: "تحديث فوري",
            sms_info_title: "📱 إشعار الرسائل النصية مفعل",
            sms_info_desc: "ستتلقى رسالة نصية عندما يحين دورك. يمكنك الانتظار بكل راحة.",
            title_called: "حان دورك! 🎉",
            subtitle_called: "الجزار ينتظرك عند المنضدة.",
            called_confirmation: "حان دورك",
            review_title: "رأيك يهمنا!",
            review_btn: "قيمنا على جوجل",
            location: "سوق مو - تولوز",
            soon: "قريبا!",
            persons_ahead: "أشخاص"
        }
    }
};

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('fr');

    const t = (section, key) => {
        return translations[language][section][key] || key;
    };

    const isRTL = language === 'ar';

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
            <div dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: isRTL ? 'Tahoma, Arial, sans-serif' : 'inherit' }}>
                {children}
            </div>
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
