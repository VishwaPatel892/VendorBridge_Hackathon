import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

const rules = [
  { label: '8+ characters', test: (pw: string) => pw.length >= 8 },
  { label: 'Uppercase letter', test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'Lowercase letter', test: (pw: string) => /[a-z]/.test(pw) },
  { label: 'Number', test: (pw: string) => /[0-9]/.test(pw) },
  { label: 'Special character', test: (pw: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pw) },
];

function getStrength(password: string): { level: number; label: string; color: string; bg: string } {
  if (!password) return { level: 0, label: '', color: '', bg: '' };
  const passed = rules.filter((r) => r.test(password)).length;
  if (passed <= 1) return { level: 1, label: 'Weak', color: 'text-red-500', bg: 'bg-red-500' };
  if (passed <= 2) return { level: 2, label: 'Fair', color: 'text-orange-500', bg: 'bg-orange-500' };
  if (passed <= 3) return { level: 3, label: 'Good', color: 'text-[#b58900]', bg: 'bg-[#b58900]' };
  return { level: 4, label: 'Strong', color: 'text-green-500', bg: 'bg-green-500' };
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = getStrength(password);
  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5 w-full">
      <div className="flex gap-1 w-full">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition ${
              strength.level >= level ? strength.bg : 'bg-muted'
            }`}
          />
        ))}
        {strength.label && (
          <span className={`text-[9px] font-semibold ml-1 ${strength.color}`}>{strength.label}</span>
        )}
      </div>
      <div className="space-y-0.5 mt-2">
        {rules.map((rule) => {
          const passed = rule.test(password);
          return (
            <div key={rule.label} className="flex items-center gap-1.5">
              {passed ? (
                <Check className="h-2.5 w-2.5 text-green-500" />
              ) : (
                <X className="h-2.5 w-2.5 text-muted-foreground" />
              )}
              <span className={`text-[9px] ${passed ? 'text-green-500' : 'text-muted-foreground'}`}>{rule.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
