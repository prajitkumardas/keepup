import { router } from 'expo-router';
import { useState } from 'react';

import { useAuth } from '@/auth/auth-context';
import { AppText } from '@/design-system/app-text';
import { Button } from '@/design-system/button';
import { AuthInput, AuthNotice, AuthShell } from '@/features/auth/auth-shell';
import { getErrorMessage } from '@/lib/errors';
import { copy } from '@/localization/copy.en';

export default function SignUpScreen() {
  const { signUp, isConfigured } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true); setError(undefined); setMessage(undefined);
    try {
      const confirmationRequired = await signUp(displayName, email, password);
      if (confirmationRequired) setMessage(copy.auth.confirmationSent);
    } catch (nextError) { setError(getErrorMessage(nextError, 'We could not create your account.')); }
    finally { setSubmitting(false); }
  };

  return <AuthShell title={copy.auth.signUpTitle} subtitle={copy.auth.signUpSubtitle}>
    {!isConfigured ? <AuthNotice message={copy.auth.configurationMissing} danger /> : null}
    {error ? <AuthNotice message={error} danger /> : null}{message ? <AuthNotice message={message} /> : null}
    <AuthInput label={copy.auth.displayName} value={displayName} onChangeText={setDisplayName} autoCapitalize="words" autoComplete="name" textContentType="name" />
    <AuthInput label={copy.auth.email} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" />
    <AuthInput label={copy.auth.password} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete="new-password" textContentType="newPassword" onSubmitEditing={() => void submit()} />
    <AppText variant="bodySmall" tone="secondary">{copy.auth.passwordHint}</AppText>
    <Button label={submitting ? `${copy.auth.createAccount}...` : copy.auth.createAccount} onPress={() => void submit()} disabled={!isConfigured || submitting || !displayName.trim() || !email.trim() || password.length < 8} />
    <Button label={copy.auth.haveAccount} variant="tertiary" onPress={() => router.replace('./sign-in')} />
  </AuthShell>;
}
