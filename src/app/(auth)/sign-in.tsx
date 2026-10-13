import { router } from 'expo-router';
import { useState } from 'react';

import { useAuth } from '@/auth/auth-context';
import { Button } from '@/design-system/button';
import { AuthInput, AuthNotice, AuthShell } from '@/features/auth/auth-shell';
import { getErrorMessage } from '@/lib/errors';
import { copy } from '@/localization/copy.en';

export default function SignInScreen() {
  const { signIn, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true); setError(undefined);
    try { await signIn(email, password); }
    catch (nextError) { setError(getErrorMessage(nextError, 'We could not sign you in.')); }
    finally { setSubmitting(false); }
  };

  return <AuthShell title={copy.auth.signInTitle} subtitle={copy.auth.signInSubtitle}>
    {!isConfigured ? <AuthNotice message={copy.auth.configurationMissing} danger /> : null}
    {error ? <AuthNotice message={error} danger /> : null}
    <AuthInput label={copy.auth.email} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" />
    <AuthInput label={copy.auth.password} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete="current-password" textContentType="password" onSubmitEditing={() => void submit()} />
    <Button label={submitting ? `${copy.auth.signIn}...` : copy.auth.signIn} onPress={() => void submit()} disabled={!isConfigured || submitting || !email.trim() || !password} />
    <Button label={copy.auth.forgotPassword} variant="tertiary" onPress={() => router.push('./forgot-password')} />
    <Button label={copy.auth.noAccount} variant="secondary" onPress={() => router.push('./sign-up')} />
  </AuthShell>;
}
