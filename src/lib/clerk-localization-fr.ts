import type { LocalizationResource } from "@clerk/types";

/**
 * Localisation française minimale des composants Clerk (SignIn/SignUp).
 * Écrite à la main plutôt que via @clerk/localizations pour éviter une
 * dépendance externe supplémentaire — couvre les champs et boutons visibles
 * sur les écrans d'inscription/connexion.
 */
export const clerkFrFR: LocalizationResource = {
  locale: "fr-FR",
  socialButtonsBlockButton: "Continuer avec {{provider|titleize}}",
  dividerText: "ou",
  formButtonPrimary: "Continuer",
  formFieldLabel__emailAddress: "Adresse e-mail",
  formFieldLabel__emailAddresses: "Adresses e-mail",
  formFieldLabel__password: "Mot de passe",
  formFieldLabel__firstName: "Prénom",
  formFieldLabel__lastName: "Nom",
  formFieldLabel__username: "Nom d'utilisateur",
  formFieldLabel__confirmPassword: "Confirmer le mot de passe",
  formFieldLabel__phoneNumber: "Numéro de téléphone",
  formFieldInputPlaceholder__emailAddress: "Ton adresse e-mail",
  formFieldInputPlaceholder__password: "Ton mot de passe",
  formFieldInputPlaceholder__firstName: "Ton prénom",
  formFieldInputPlaceholder__lastName: "Ton nom",
  formFieldAction__forgotPassword: "Mot de passe oublié ?",
  formFieldHintText__optional: "Optionnel",
  signUp: {
    start: {
      title: "Crée ton compte",
      subtitle: "pour continuer sur Passion Spark",
      actionText: "Déjà un compte ?",
      actionLink: "Se connecter",
    },
    emailLink: {
      title: "Vérifie ton e-mail",
      subtitle: "pour continuer sur Passion Spark",
      formTitle: "Lien de vérification",
      formSubtitle: "Utilise le lien envoyé à ton adresse e-mail",
      resendButton: "Renvoyer le lien",
    },
    emailCode: {
      title: "Vérifie ton e-mail",
      subtitle: "pour continuer sur Passion Spark",
      formTitle: "Code de vérification",
      formSubtitle: "Entre le code envoyé à ton adresse e-mail",
      resendButton: "Renvoyer le code",
    },
    continue: {
      title: "Complète les champs manquants",
      subtitle: "pour continuer sur Passion Spark",
      actionText: "Déjà un compte ?",
      actionLink: "Se connecter",
    },
  },
  signIn: {
    start: {
      title: "Connexion",
      subtitle: "pour continuer sur Passion Spark",
      actionText: "Pas encore de compte ?",
      actionLink: "S'inscrire",
    },
    password: {
      title: "Entre ton mot de passe",
      subtitle: "pour continuer sur Passion Spark",
      actionLink: "Utiliser une autre méthode",
    },
    forgotPasswordAlternativeMethods: {
      title: "Mot de passe oublié ?",
      label__alternativeMethods: "Ou connecte-toi avec une autre méthode",
      blockButton__resetPassword: "Réinitialiser ton mot de passe",
    },
  },
  userButton: {
    action__signOut: "Se déconnecter",
    action__manageAccount: "Gérer le compte",
  },
  formFieldError__matchingPasswords: "Les mots de passe correspondent.",
  formFieldError__notMatchingPasswords: "Les mots de passe ne correspondent pas.",
  unstable__errors: {
    form_password_pwned: "Ce mot de passe a été compromis et ne peut pas être utilisé, merci d'en choisir un autre.",
    form_param_format_invalid__email_address: "L'adresse e-mail doit être valide.",
    form_identifier_not_found: "Aucun compte trouvé avec ces identifiants.",
  },
} as unknown as LocalizationResource;
