export const getCarryHints = (onesA: number, onesB: number): string[] => {
  const missingTo10 = Math.max(0, 10 - onesA)
  return [
    `Wie viele fehlen von ${onesA} bis 10? Es fehlen ${missingTo10}.`,
    `Markiere ${Math.min(onesB, missingTo10)} Einer aus der zweiten Zahl und bündle dann 10 Einer zu 1 Zehner.`,
  ]
}

export const errorLabelMap: Record<string, string> = {
  sum_not_10: '10er-Freunde vertauscht',
  carry_missed: 'Übertrag vergessen',
  place_value_confusion: 'Stellenwert verwechselt',
}

export const labelForError = (errorKey: string): string => {
  return errorLabelMap[errorKey] ?? errorKey
}
