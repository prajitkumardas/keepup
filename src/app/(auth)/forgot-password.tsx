import { router } from 'expo-router';
import { useState } from 'react';

import { useAuth } from '@/auth/auth-context';
import { Button } from '@/design-system/button';
import { AuthInput, AuthNotice, AuthShell } from '@/features/auth/auth-shell';
import { getErrorMessage } from '@/lib/errors';
import { copy } from '@/localization/copy.en';

export default function ForgotPasswordScreen() {
  const { sendPasswordReset, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true); setError(undefined);
    try { await sendPasswordReset(email); setSent(true); }
    catch (nextError) { setError(getErrorMessage(nextError, 'We could not send the recovery email.')); }
    finally { setSubmitting(false); }
  };

  return <AuthShell title={copy.auth.forgotTitle} subtitle={copy.auth.forgotSubtitle}>
    {!isConfigured ? <AuthNotice message={copy.auth.configurationMissing} danger /> : null}
    {error ? <AuthNotice message={error} danger /> : null}{sent ? <AuthNotice message={copy.auth.resetSent} /> : null}
    <AuthInput label={copy.auth.email} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" onSubmitEditing={() => void submit()} />
    <Button label={submitting ? `${copy.auth.sendReset}...` : copy.auth.sendReset} onPress={() => void submit()} disabled={!isConfigured || submitting || !email.trim()} />
    <Button label={copy.auth.backToSignIn} variant="tertiary" onPress={() => router.replace('./sign-in')} />
  </AuthShell>;
}
