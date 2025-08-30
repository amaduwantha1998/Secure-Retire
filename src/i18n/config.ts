import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      hero: {
        title: "Secure Your Retirement Future",
        subtitle: "Plan, invest, and retire with confidence using our comprehensive retirement planning platform.",
        cta: "Start Planning Today",
        secureRetirementTitle: "Secure Your Retirement Future Today",
        aiPoweredSubtitle: "Plan and protect your finances with AI-powered tools - As of August 16, 2025"
      },
      common: {
        welcome: "Welcome to Secure Retire",
        getStarted: "Get Started",
        learnMore: "Learn More",
        currency: "Currency",
        language: "Language",
        signUpFree: "Sign Up for Free",
        goToDashboard: "Go to Dashboard",
        selectLanguage: "Select language",
        email: "Email",
        password: "Password",
        signIn: "Sign In",
        signUp: "Sign Up",
        forgotPassword: "Forgot Password?",
        needAccount: "Need an account? Sign Up",
        haveAccount: "Already have an account? Sign In",
        loading: "Loading...",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        close: "Close"
      },
      features: {
        title: "Everything You Need to Retire Securely",
        subtitle: "Comprehensive retirement planning tools powered by AI",
        financialPlanning: {
          title: "Financial Planning",
          description: "Monitor income, assets, and debts with AI insights"
        },
        legalSupport: {
          title: "Legal Support", 
          description: "Easily create wills and trusts with e-signatures"
        },
        retirementCalculator: {
          title: "Retirement Calculator",
          description: "Predict your future with advanced simulations"
        }
      },
      cta: {
        title: "Join Secure Retire Now!",
        subtitle: "Start planning your secure retirement future today with our comprehensive AI-powered tools.",
        signUpButton: "Sign Up for Free and Start Planning Today!",
        videoPlaceholder: "Watch Our 15-Second Intro Video"
      },
      nav: {
        home: "Home",
        planning: "Planning",
        investments: "Investments", 
        goals: "Goals",
        reports: "Reports",
        settings: "Settings",
        signin: "Sign In",
        signup: "Sign Up",
        signout: "Sign Out",
        overview: "Overview",
        financialManagement: "Financial Management",
        documentsHandling: "Documents Handling",
        retirementCalculator: "Retirement Calculator",
        investmentSettings: "Investment Settings",
        beneficiaries: "Beneficiaries",
        consultations: "Consultations",
        profileSettings: "Profile Settings",
        helpCenter: "Help Center"
      },
      auth: {
        signin: 'Sign In',
        signup: 'Sign Up',
        signout: 'Sign Out',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        phone: 'Phone Number',
        fullName: 'Full Name',
        forgotPassword: 'Forgot Password?',
        resetPassword: 'Reset Password',
        dontHaveAccount: "Don't have an account?",
        alreadyHaveAccount: 'Already have an account?',
        signInWithGoogle: 'Sign in with Google',
        signInWithApple: 'Sign in with Apple',
        signInWithPhone: 'Sign in with Phone',
        sendOTP: 'Send OTP',
        verifyOTP: 'Verify OTP',
        enterOTP: 'Enter verification code',
        resendOTP: 'Resend code',
        loading: 'Loading...',
        or: 'or',
        checkEmail: 'Please check your email for the confirmation link.',
        passwordReset: 'Password reset email sent!',
        welcome: 'Welcome to Secure Retire',
        passwordRequirements: {
          minLength: 'Password must be at least 8 characters',
          lowercase: 'Password must contain a lowercase letter',
          uppercase: 'Password must contain an uppercase letter',
          number: 'Password must contain a number',
          special: 'Password must contain a special character'
        },
        errors: {
          generic: 'An error occurred. Please try again.',
          invalidCredentials: 'Invalid email or password',
          userExists: 'An account with this email already exists',
          emailNotConfirmed: 'Please confirm your email address',
          passwordTooShort: 'Password must be at least 6 characters',
          invalidEmail: 'Please enter a valid email address',
          invalidPhone: 'Please enter a valid phone number',
          invalidToken: 'Invalid or expired verification code',
          smsError: 'Unable to send SMS. Please try again.',
          tooManyRequests: 'Too many requests. Please wait before trying again.',
          networkError: 'Network error. Please check your connection.',
          signupDisabled: 'Account registration is currently disabled'
        }
      }
    }
  },
  si: {
    translation: {
      hero: {
        title: "ඔබේ විශ්‍රාම අනාගතය සුරක්ෂිත කරන්න",
        subtitle: "අපගේ සම්පූර්ණ විශ්‍රාම සැලසුම් වේදිකාව සමඟ විශ්වාසයෙන් සැලසුම් කරන්න, ආයෝජනය කරන්න සහ විශ්‍රාම යන්න.",
        cta: "අද සැලසුම් කිරීම ආරම්භ කරන්න",
        secureRetirementTitle: "අද ඔබේ විශ්‍රාම අනාගතය සුරක්ෂිත කරන්න",
        aiPoweredSubtitle: "AI උපකරණ සමඟ ඔබේ මූල්‍ය සැලසුම් කරන්න සහ ආරක්ෂා කරන්න - 2025 අගෝස්තු 16 වනදා සිට"
      },
      common: {
        welcome: "Secure Retire වෙත ආයුබෝවන්",
        getStarted: "අරඹන්න",
        learnMore: "තව දැන ගන්න",
        currency: "මුදල්",
        language: "භාෂාව",
        signUpFree: "නොමිලේ ලියාපදිංචි වන්න",
        goToDashboard: "ඩෑෂ්බෝඩ් වෙත යන්න",
        selectLanguage: "භාෂාව තෝරන්න",
        email: "ඊමේල්",
        password: "මුරපදය",
        signIn: "ඇතුල් වන්න",
        signUp: "ලියාපදිංචි වන්න",
        forgotPassword: "මුරපදය අමතකද?",
        needAccount: "ගිණුමක් අවශ්‍යද? ලියාපදිංචි වන්න",
        haveAccount: "දැනටමත් ගිණුමක් තිබේද? ඇතුල් වන්න",
        loading: "පූරණය වෙමින්...",
        save: "සුරකින්න",
        cancel: "අවලංගු කරන්න",
        delete: "මකන්න",
        edit: "සංස්කරණය කරන්න",
        close: "වසන්න"
      },
      features: {
        title: "සුරක්ෂිතව විශ්‍රාම යාමට අවශ්‍ය සියල්ල",
        subtitle: "AI මගින් ක්‍රියාත්මක වන සම්පූර්ණ විශ්‍රාම සැලසුම් උපකරණ",
        financialPlanning: {
          title: "මූල්‍ය සැලසුම්",
          description: "AI තීක්ෂ්ණතා සමඟ ආදායම්, වත්කම් සහ ණය නිරීක්ෂණය කරන්න"
        },
        legalSupport: {
          title: "නීතිමය ආධාර", 
          description: "ඉ-අත්සන් සමඟ පහසුවෙන් කැමැත්තක් සහ භාර නිර්මාණය කරන්න"
        },
        retirementCalculator: {
          title: "විශ්‍රාම ගණකය",
          description: "උසස් සිමියුලේෂන් සමඟ ඔබේ අනාගතය පුරෝකථනය කරන්න"
        }
      },
      cta: {
        title: "අදම Secure Retire හා එකතු වන්න!",
        subtitle: "අපගේ සම්පූර්ණ AI උපකරණ සමඟ අදම ඔබේ සුරක්ෂිත විශ්‍රාම අනාගතය සැලසුම් කිරීම ආරම්භ කරන්න.",
        signUpButton: "නොමිලේ ලියාපදිංචි වී අදම සැලසුම් කිරීම ආරම්භ කරන්න!",
        videoPlaceholder: "අපගේ තත්පර 15 හැඳින්වීමේ වීඩියෝව බලන්න"
      },
      nav: {
        home: "මුල් පිටුව",
        planning: "සැලසුම්",
        investments: "ආයෝජන",
        goals: "ඉලක්ක",
        reports: "වාර්තා",
        settings: "සැකසුම්",
        signin: "ඇතුල් වන්න",
        signup: "ලියාපදිංචි වන්න",
        signout: "පිටවන්න",
        overview: "දළ විශ්ලේෂණය",
        financialManagement: "මූල්‍ය කළමනාකරණය",
        documentsHandling: "ලේඛන කළමනාකරණය",
        retirementCalculator: "විශ්‍රාම ගණකය",
        investmentSettings: "ආයෝජන සැකසුම්",
        beneficiaries: "ප්‍රතිලාභීන්",
        consultations: "උපදේශන",
        profileSettings: "පැතිකඩ සැකසුම්",
        helpCenter: "උපකාර මධ්‍යස්ථානය"
      },
      auth: {
        signin: 'ඇතුල් වන්න',
        signup: 'ලියාපදිංචි වන්න',
        signout: 'පිටවන්න',
        email: 'ඊමේල්',
        password: 'මුරපදය',
        confirmPassword: 'මුරපදය තහවුරු කරන්න',
        phone: 'දුරකථන අංකය',
        fullName: 'සම්පූර්ණ නම',
        forgotPassword: 'මුරපදය අමතකද?',
        resetPassword: 'මුරපදය නැවත සකසන්න',
        dontHaveAccount: "ගිණුමක් නැද්ද?",
        alreadyHaveAccount: 'දැනටමත් ගිණුමක් තිබේද?',
        signInWithGoogle: 'Google සමඟ ඇතුල් වන්න',
        signInWithApple: 'Apple සමඟ ඇතුල් වන්න',
        signInWithPhone: 'දුරකථනය සමඟ ඇතුල් වන්න',
        sendOTP: 'OTP එවන්න',
        verifyOTP: 'OTP සත්‍යාපනය කරන්න',
        enterOTP: 'සත්‍යාපන කේතය ඇතුල් කරන්න',
        resendOTP: 'කේතය නැවත එවන්න',
        loading: 'පූරණය වෙමින්...',
        or: 'හෝ',
        checkEmail: 'තහවුරු කිරීමේ සබැඳිය සඳහා ඔබගේ ඊමේල් පරීක්ෂා කරන්න.',
        passwordReset: 'මුරපදය නැවත සකසන ඊමේල් එවා ඇත!',
        welcome: 'Secure Retire වෙත ආයුබෝවන්',
        errors: {
          generic: 'දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.',
          invalidCredentials: 'වලංගු නොවන ඊමේල් හෝ මුරපදය',
          userExists: 'මෙම ඊමේල් සමඟ ගිණුමක් දැනටමත් පවතී',
          emailNotConfirmed: 'කරුණාකර ඔබගේ ඊමේල් ලිපිනය තහවුරු කරන්න',
          passwordTooShort: 'මුරපදය අවම වශයෙන් අක්ෂර 6ක් විය යුතුයි',
          invalidEmail: 'කරුණාකර වලංගු ඊමේල් ලිපිනයක් ඇතුල් කරන්න',
          invalidPhone: 'කරුණාකර වලංගු දුරකථන අංකයක් ඇතුල් කරන්න',
          invalidToken: 'වලංගු නොවන හෝ කල් ඉකුත් වූ සත්‍යාපන කේතය',
          smsError: 'SMS එවීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.',
          tooManyRequests: 'ඉල්ලීම් වැඩිය. නැවත උත්සාහ කිරීමට පෙර රන්ඳන්න.',
          networkError: 'ජාල දෝෂය. ඔබගේ සම්බන්ධතාව පරීක්ෂා කරන්න.',
          signupDisabled: 'ගිණුම් ලියාපදිංචිය දැනට අක්‍රීයයි'
        }
      }
    }
  },
  ta: {
    translation: {
      hero: {
        title: "உங்கள் ஓய்வூதிய எதிர்காலத்தைப் பாதுகாக்கவும்",
        subtitle: "எங்கள் விரிவான ஓய்வூதிய திட்டமிடல் தளத்தைப் பயன்படுத்தி நம்பிக்கையுடன் திட்டமிடவும், முதலீடு செய்யவும் மற்றும் ஓய்வெடுக்கவும்.",
        cta: "இன்று திட்டமிடலைத் தொடங்குங்கள்",
        secureRetirementTitle: "இன்று உங்கள் ஓய்வூதிய எதிர்காலத்தைப் பாதுகாக்கவும்",
        aiPoweredSubtitle: "AI கருவிகளுடன் உங்கள் நிதிகளைத் திட்டமிடவும் மற்றும் பாதுகாக்கவும் - ஆகஸ்ட் 16, 2025 முதல்"
      },
      common: {
        welcome: "Secure Retire க்கு வரவேற்கிறோம்",
        getStarted: "தொடங்குங்கள்",
        learnMore: "மேலும் அறிக",
        currency: "நாணயம்",
        language: "மொழி",
        signUpFree: "இலவசமாக பதிவுசெய்க",
        goToDashboard: "டாஷ்போர்டுக்குச் செல்லுங்கள்",
        selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
        email: "மின்னஞ்சல்",
        password: "கடவுச்சொல்",
        signIn: "உள்நுழைக",
        signUp: "பதிவுசெய்க",
        forgotPassword: "கடவுச்சொல் மறந்துவிட்டதா?",
        needAccount: "கணக்கு தேவையா? பதிவுசெய்க",
        haveAccount: "ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைக",
        loading: "ஏற்றுகிறது...",
        save: "சேமிக்கவும்",
        cancel: "ரத்துசெய்",
        delete: "நீக்கு",
        edit: "திருத்து",
        close: "மூடு"
      },
      features: {
        title: "பாதுகாப்பாக ஓய்வுபெற தேவையான அனைத்தும்",
        subtitle: "AI ஆல் இயக்கப்படும் விரிவான ஓய்வூதிய திட்டமிடல் கருவிகள்",
        financialPlanning: {
          title: "நிதித் திட்டமிடல்",
          description: "AI நுண்ணறிவுடன் வருமானம், சொத்துக்கள் மற்றும் கடன்களைக் கண்காணிக்கவும்"
        },
        legalSupport: {
          title: "சட்ட ஆதரவு",
          description: "மின்னணு கையெழுத்துகளுடன் எளிதாக உயில்கள் மற்றும் அறக்கட்டளைகளை உருவாக்கவும்"
        },
        retirementCalculator: {
          title: "ஓய்வூதிய கணிப்பான்",
          description: "மேம்பட்ட உருவகங்களுடன் உங்கள் எதிர்காலத்தை முன்னறிவிக்கவும்"
        }
      },
      cta: {
        title: "இன்றே Secure Retire இல் சேரவும்!",
        subtitle: "எங்கள் விரிவான AI கருவிகளுடன் இன்று உங்கள் பாதுகாப்பான ஓய்வூதிய எதிர்காலத்தைத் திட்டமிடத் தொடங்குங்கள்.",
        signUpButton: "இலவசமாக பதிவுசெய்து இன்றே திட்டமிடத் தொடங்குங்கள்!",
        videoPlaceholder: "எங்கள் 15-வினாடி அறிமுக வீடியோவைப் பாருங்கள்"
      },
      nav: {
        home: "முகப்பு",
        planning: "திட்டமிடல்",
        investments: "முதலீடுகள்",
        goals: "இலக்குகள்",
        reports: "அறிக்கைகள்",
        settings: "அமைப்புகள்",
        signin: "உள்நுழைக",
        signup: "பதிவுசெய்க",
        signout: "வெளியேறு",
        overview: "மேலோட்டம்",
        financialManagement: "நிதி மேலாண்மை",
        documentsHandling: "ஆவண மேலாண்மை",
        retirementCalculator: "ஓய்வூதிய கணிப்பான்",
        investmentSettings: "முதலீட்டு அமைப்புகள்",
        beneficiaries: "பயனாளிகள்",
        consultations: "ஆலோசனைகள்",
        profileSettings: "சுயவிவர அமைப்புகள்",
        helpCenter: "உதவி மையம்"
      },
      auth: {
        signin: 'உள்நுழைக',
        signup: 'பதிவுசெய்க',
        signout: 'வெளியேறு',
        email: 'மின்னஞ்சல்',
        password: 'கடவுச்சொல்',
        confirmPassword: 'கடவுச்சொல்லை உறுதிசெய்யவும்',
        phone: 'தொலைபேசி எண்',
        fullName: 'முழு பெயர்',
        forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
        resetPassword: 'கடவுச்சொல்லை மீட்டமைக்கவும்',
        dontHaveAccount: "கணக்கு இல்லையா?",
        alreadyHaveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
        signInWithGoogle: 'Google உடன் உள்நுழைக',
        signInWithApple: 'Apple உடன் உள்நுழைக',
        signInWithPhone: 'தொலைபேசி உடன் உள்நுழைக',
        sendOTP: 'OTP அனுப்பு',
        verifyOTP: 'OTP சரிபார்க்கவும்',
        enterOTP: 'சரிபார்ப்புக் குறியீட்டை உள்ளிடவும்',
        resendOTP: 'குறியீட்டை மீண்டும் அனுப்பு',
        loading: 'ஏற்றுகிறது...',
        or: 'அல்லது',
        checkEmail: 'உறுதிப்படுத்தல் இணைப்பிற்கு உங்கள் மின்னஞ்சலைச் சரிபார்க்கவும்.',
        passwordReset: 'கடவுச்சொல் மீட்டமைப்பு மின்னஞ்சல் அனுப்பப்பட்டது!',
        welcome: 'Secure Retire க்கு வரவேற்கிறோம்',
        errors: {
          generic: 'ஒரு பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.',
          invalidCredentials: 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல்',
          userExists: 'இந்த மின்னஞ்சலுடன் ஏற்கனவே ஒரு கணக்கு உள்ளது',
          emailNotConfirmed: 'உங்கள் மின்னஞ்சல் முகவரியை உறுதிசெய்யவும்',
          passwordTooShort: 'கடவுச்சொல் குறைந்தது 6 எழுத்துக்களாக இருக்க வேண்டும்',
          invalidEmail: 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்',
          invalidPhone: 'சரியான தொலைபேசி எண்ணை உள்ளிடவும்',
          invalidToken: 'தவறான அல்லது காலாவதியான சரிபார்ப்புக் குறியீடு',
          smsError: 'SMS அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
          tooManyRequests: 'அதிக கோரிக்கைகள். மீண்டும் முயற்சிப்பதற்கு முன் காத்திருக்கவும்.',
          networkError: 'நெட்வொர்க் பிழை. உங்கள் இணைப்பைச் சரிபார்க்கவும்.',
          signupDisabled: 'கணக்கு பதிவு தற்போது முடக்கப்பட்டுள்ளது'
        }
      }
    }
  },
  es: {
    translation: {
      hero: {
        title: "Asegura Tu Futuro de Jubilación",
        subtitle: "Planifica, invierte y jubílate con confianza usando nuestra plataforma integral de planificación de jubilación.",
        cta: "Comienza a Planificar Hoy",
        secureRetirementTitle: "Asegura Tu Futuro de Jubilación Hoy",
        aiPoweredSubtitle: "Planifica y protege tus finanzas con herramientas impulsadas por IA - Al 16 de agosto de 2025"
      },
      common: {
        welcome: "Bienvenido a Secure Retire",
        getStarted: "Comenzar",
        learnMore: "Aprende Más", 
        currency: "Moneda",
        language: "Idioma",
        signUpFree: "Regístrate Gratis",
        goToDashboard: "Ir al Panel",
        selectLanguage: "Seleccionar idioma",
        email: "Correo electrónico",
        password: "Contraseña",
        signIn: "Iniciar sesión",
        signUp: "Registrarse",
        forgotPassword: "¿Olvidaste tu contraseña?",
        needAccount: "¿Necesitas una cuenta? Regístrate",
        haveAccount: "¿Ya tienes cuenta? Inicia sesión",
        loading: "Cargando...",
        save: "Guardar",
        cancel: "Cancelar",
        delete: "Eliminar",
        edit: "Editar",
        close: "Cerrar"
      },
      features: {
        title: "Todo Lo Que Necesitas Para Jubilarte Seguro",
        subtitle: "Herramientas integrales de planificación de jubilación impulsadas por IA",
        financialPlanning: {
          title: "Planificación Financiera",
          description: "Monitorea ingresos, activos y deudas con información de IA"
        },
        legalSupport: {
          title: "Soporte Legal",
          description: "Crea fácilmente testamentos y fideicomisos con firmas electrónicas"
        },
        retirementCalculator: {
          title: "Calculadora de Jubilación",
          description: "Predice tu futuro con simulaciones avanzadas"
        }
      },
      cta: {
        title: "¡Únete a Secure Retire Ahora!",
        subtitle: "Comienza a planificar tu futuro seguro de jubilación hoy con nuestras herramientas integrales impulsadas por IA.",
        signUpButton: "¡Regístrate Gratis y Comienza a Planificar Hoy!",
        videoPlaceholder: "Ve Nuestro Video Introductorio de 15 Segundos"
      },
      nav: {
        home: "Inicio",
        planning: "Planificación",
        investments: "Inversiones",
        goals: "Objetivos", 
        reports: "Reportes",
        settings: "Configuración",
        signin: "Iniciar Sesión",
        signup: "Registrarse",
        signout: "Cerrar Sesión",
        overview: "Resumen",
        financialManagement: "Gestión Financiera",
        documentsHandling: "Manejo de Documentos",
        retirementCalculator: "Calculadora de Jubilación",
        investmentSettings: "Configuración de Inversiones",
        beneficiaries: "Beneficiarios",
        consultations: "Consultas",
        profileSettings: "Configuración de Perfil",
        helpCenter: "Centro de Ayuda"
      },
      auth: {
        signin: 'Iniciar Sesión',
        signup: 'Registrarse',
        signout: 'Cerrar Sesión',
        email: 'Correo Electrónico',
        password: 'Contraseña',
        confirmPassword: 'Confirmar Contraseña',
        phone: 'Número de Teléfono',
        fullName: 'Nombre Completo',
        forgotPassword: '¿Olvidaste tu contraseña?',
        resetPassword: 'Restablecer Contraseña',
        dontHaveAccount: "¿No tienes una cuenta?",
        alreadyHaveAccount: '¿Ya tienes una cuenta?',
        signInWithGoogle: 'Iniciar sesión con Google',
        signInWithApple: 'Iniciar sesión con Apple',
        signInWithPhone: 'Iniciar sesión con teléfono',
        sendOTP: 'Enviar código',
        verifyOTP: 'Verificar código',
        enterOTP: 'Introduce el código de verificación',
        resendOTP: 'Reenviar código',
        loading: 'Cargando...',
        or: 'o',
        checkEmail: 'Revisa tu correo electrónico para el enlace de confirmación.',
        passwordReset: '¡Correo de restablecimiento de contraseña enviado!',
        welcome: 'Bienvenido a Secure Retire',
        errors: {
          generic: 'Ocurrió un error. Inténtalo de nuevo.',
          invalidCredentials: 'Correo electrónico o contraseña inválidos',
          userExists: 'Ya existe una cuenta con este correo electrónico',
          emailNotConfirmed: 'Por favor confirma tu dirección de correo electrónico',
          passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
          invalidEmail: 'Por favor introduce un correo electrónico válido',
          invalidPhone: 'Por favor introduce un número de teléfono válido',
          invalidToken: 'Código de verificación inválido o expirado',
          smsError: 'No se pudo enviar el SMS. Inténtalo de nuevo.',
          tooManyRequests: 'Demasiadas solicitudes. Espera antes de intentar de nuevo.',
          networkError: 'Error de red. Verifica tu conexión.',
          signupDisabled: 'El registro de cuentas está actualmente deshabilitado'
        }
      }
    }
  },
  zh: {
    translation: {
      hero: {
        title: "确保您的退休未来",
        subtitle: "使用我们全面的退休规划平台，自信地规划、投资和退休。",
        cta: "今天开始规划",
        secureRetirementTitle: "立即确保您的退休未来",
        aiPoweredSubtitle: "使用AI工具规划和保护您的财务 - 截至2025年8月16日"
      },
      common: {
        welcome: "欢迎来到安全退休",
        getStarted: "开始使用",
        learnMore: "了解更多",
        currency: "货币",
        language: "语言",
        signUpFree: "免费注册",
        goToDashboard: "前往仪表板",
        selectLanguage: "选择语言",
        email: "邮箱",
        password: "密码",
        signIn: "登录",
        signUp: "注册",
        forgotPassword: "忘记密码？",
        needAccount: "需要账户？注册",
        haveAccount: "已有账户？登录",
        loading: "加载中...",
        save: "保存",
        cancel: "取消",
        delete: "删除",
        edit: "编辑",
        close: "关闭"
      },
      features: {
        title: "安全退休所需的一切",
        subtitle: "由AI驱动的综合退休规划工具",
        financialPlanning: {
          title: "财务规划",
          description: "通过AI洞察监控收入、资产和债务"
        },
        legalSupport: {
          title: "法律支持",
          description: "轻松创建遗嘱和信托，支持电子签名"
        },
        retirementCalculator: {
          title: "退休计算器",
          description: "通过高级模拟预测您的未来"
        }
      },
      cta: {
        title: "立即加入安全退休！",
        subtitle: "立即开始使用我们全面的AI工具规划您安全的退休未来。",
        signUpButton: "免费注册并立即开始规划！",
        videoPlaceholder: "观看我们的15秒介绍视频"
      },
      nav: {
        home: "首页",
        planning: "规划",
        investments: "投资",
        goals: "目标",
        reports: "报告", 
        settings: "设置",
        signin: "登录",
        signup: "注册",
        signout: "退出",
        overview: "概览",
        financialManagement: "财务管理",
        documentsHandling: "文档处理",
        retirementCalculator: "退休计算器",
        investmentSettings: "投资设置",
        beneficiaries: "受益人",
        consultations: "咨询",
        profileSettings: "个人设置",
        helpCenter: "帮助中心"
      },
      auth: {
        signin: '登录',
        signup: '注册',
        signout: '退出',
        email: '邮箱',
        password: '密码',
        confirmPassword: '确认密码',
        phone: '电话号码',
        fullName: '全名',
        forgotPassword: '忘记密码？',
        resetPassword: '重置密码',
        dontHaveAccount: "没有账户？",
        alreadyHaveAccount: '已有账户？',
        signInWithGoogle: '使用Google登录',
        signInWithApple: '使用Apple登录',
        signInWithPhone: '使用手机号登录',
        sendOTP: '发送验证码',
        verifyOTP: '验证码',
        enterOTP: '输入验证码',
        resendOTP: '重新发送',
        loading: '加载中...',
        or: '或',
        checkEmail: '请检查您的邮箱确认链接。',
        passwordReset: '密码重置邮件已发送！',
        welcome: '欢迎来到安全退休',
        errors: {
          generic: '发生错误，请重试。',
          invalidCredentials: '邮箱或密码无效',
          userExists: '该邮箱已存在账户',
          emailNotConfirmed: '请确认您的邮箱地址',
          passwordTooShort: '密码至少需要6个字符',
          invalidEmail: '请输入有效的邮箱地址',
          invalidPhone: '请输入有效的电话号码',
          invalidToken: '验证码无效或已过期',
          smsError: '无法发送短信，请重试。',
          tooManyRequests: '请求过多，请稍后再试。',
          networkError: '网络错误，请检查网络连接。',
          signupDisabled: '账户注册目前已禁用'
        }
      }
    }
  },
  ja: {
    translation: {
      hero: {
        title: "あなたの退職後の未来を守る",
        subtitle: "私たちの包括的な退職プランニングプラットフォームで、自信を持って計画し、投資し、退職してください。",
        cta: "今日プランニングを始める",
        secureRetirementTitle: "今日、あなたの退職後の未来を守りましょう",
        aiPoweredSubtitle: "AIツールで財務を計画し保護する - 2025年8月16日現在"
      },
      common: {
        welcome: "Secure Retireへようこそ",
        getStarted: "始める",
        learnMore: "詳細を学ぶ",
        currency: "通貨",
        language: "言語",
        signUpFree: "無料でサインアップ",
        goToDashboard: "ダッシュボードへ",
        selectLanguage: "言語を選択",
        email: "メールアドレス",
        password: "パスワード",
        signIn: "サインイン",
        signUp: "サインアップ",
        forgotPassword: "パスワードをお忘れですか？",
        needAccount: "アカウントが必要ですか？サインアップ",
        haveAccount: "すでにアカウントをお持ちですか？サインイン",
        loading: "読み込み中...",
        save: "保存",
        cancel: "キャンセル",
        delete: "削除",
        edit: "編集",
        close: "閉じる"
      },
      features: {
        title: "安全に退職するために必要なすべて",
        subtitle: "AIを活用した包括的な退職プランニングツール",
        financialPlanning: {
          title: "ファイナンシャルプランニング",
          description: "AIの洞察で収入、資産、負債を監視"
        },
        legalSupport: {
          title: "法的サポート",
          description: "電子署名で簡単に遺言書と信託を作成"
        },
        retirementCalculator: {
          title: "退職計算機",
          description: "高度なシミュレーションであなたの未来を予測"
        }
      },
      cta: {
        title: "今すぐSecure Retireに参加しましょう！",
        subtitle: "私たちの包括的なAIツールで、今日からあなたの安全な退職後の未来を計画し始めましょう。",
        signUpButton: "無料でサインアップして今日から計画を始めましょう！",
        videoPlaceholder: "私たちの15秒紹介ビデオをご覧ください"
      },
      nav: {
        home: "ホーム",
        planning: "プランニング",
        investments: "投資",
        goals: "目標",
        reports: "レポート",
        settings: "設定",
        signin: "サインイン",
        signup: "サインアップ",
        signout: "サインアウト",
        overview: "概要",
        financialManagement: "財務管理",
        documentsHandling: "文書管理",
        retirementCalculator: "退職計算機",
        investmentSettings: "投資設定",
        beneficiaries: "受益者",
        consultations: "相談",
        profileSettings: "プロフィール設定",
        helpCenter: "ヘルプセンター"
      },
      auth: {
        signin: 'サインイン',
        signup: 'サインアップ',
        signout: 'サインアウト',
        email: 'メールアドレス',
        password: 'パスワード',
        confirmPassword: 'パスワードを確認',
        phone: '電話番号',
        fullName: 'フルネーム',
        forgotPassword: 'パスワードをお忘れですか？',
        resetPassword: 'パスワードをリセット',
        dontHaveAccount: "アカウントをお持ちでないですか？",
        alreadyHaveAccount: 'すでにアカウントをお持ちですか？',
        signInWithGoogle: 'Googleでサインイン',
        signInWithApple: 'Appleでサインイン',
        signInWithPhone: '電話でサインイン',
        sendOTP: 'OTPを送信',
        verifyOTP: 'OTPを検証',
        enterOTP: '確認コードを入力',
        resendOTP: 'コードを再送信',
        loading: '読み込み中...',
        or: 'または',
        checkEmail: '確認リンクについてメールをチェックしてください。',
        passwordReset: 'パスワードリセットメールが送信されました！',
        welcome: 'Secure Retireへようこそ',
        errors: {
          generic: 'エラーが発生しました。もう一度お試しください。',
          invalidCredentials: '無効なメールアドレスまたはパスワード',
          userExists: 'このメールアドレスのアカウントは既に存在します',
          emailNotConfirmed: 'メールアドレスを確認してください',
          passwordTooShort: 'パスワードは最低6文字である必要があります',
          invalidEmail: '有効なメールアドレスを入力してください',
          invalidPhone: '有効な電話番号を入力してください',
          invalidToken: '無効または期限切れの確認コード',
          smsError: 'SMSを送信できません。もう一度お試しください。',
          tooManyRequests: 'リクエストが多すぎます。再試行する前に待ってください。',
          networkError: 'ネットワークエラー。接続を確認してください。',
          signupDisabled: 'アカウント登録は現在無効です'
        }
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'si', 'ta', 'zh', 'es', 'ja'],
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;