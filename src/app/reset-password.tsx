import { router } from 'expo-router';
import { useState } from 'react';

import { useAuth } from '@/auth/auth-context';
import { Button } from '@/design-system/button';
import { AuthInput, AuthNotice, AuthShell } from '@/features/auth/auth-shell';
import { getErrorMessage } from '@/lib/errors';
import { copy } from '@/localization/copy.en';

export default function ResetPasswordScreen() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [updated, setUpdated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true); setError(undefined);
    try { await updatePassword(password); setUpdated(true); }
    catch (nextError) { setError(getErrorMessage(nextError, 'We could not update your password.')); }
    finally { setSubmitting(false); }
  };

  return <AuthShell title={copy.auth.resetTitle} subtitle={copy.auth.resetSubtitle}>
    {error ? <AuthNotice message={error} danger /> : null}{updated ? <AuthNotice message={copy.auth.passwordUpdated} /> : null}
    <AuthInput label={copy.auth.password} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete="new-password" textContentType="newPassword" onSubmitEditing={() => void submit()} />
    <Button label={submitting ? `${copy.auth.updatePassword}...` : copy.auth.updatePassword} onPress={() => void submit()} disabled={submitting || password.length < 8} />
    {updated ? <Button label={copy.common.done} variant="secondary" onPress={() => router.replace('/')} /> : null}
  </AuthShell>;
}
