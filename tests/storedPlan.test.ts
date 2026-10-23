import { describe, it, expect } from 'vitest';
import { parseStoredPlan, serializePlan } from '@/lib/storedPlan';

describe('parseStoredPlan / serializePlan', () => {
  const plan = { days: { 'Segunda-feira': { Breakfast: { name: 'Omelete – versão leve 🥚' } } } };

  it('round-trips text outside Latin-1, which btoa() rejects', () => {
    expect(() => btoa(JSON.stringify(plan))).toThrow();
    expect(parseStoredPlan(serializePlan(plan))).toEqual(plan);
  });

  it('still reads plans stored by older versions as base64', () => {
    const legacy = { days: { monday: { lunch: { name: 'Feijão com arroz' } } } };
    const latin1Base64 = btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(legacy))));
    expect(parseStoredPlan(btoa(JSON.stringify(legacy)))).toEqual(legacy);
    expect(parseStoredPlan(latin1Base64)).toEqual(legacy);
  });

  it.each([null, '', 'not a plan', '[1,2]', '"text"', 'null'])('rejects %j', stored => {
    expect(parseStoredPlan(stored)).toBeNull();
  });
});
