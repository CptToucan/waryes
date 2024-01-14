/**
 * Determines if the speciality is a trait, e.g. returns true if speciality is _choc, false if AT
 */
export function isSpecialtyTrait(specialty: string): boolean {
    // right now all traits begin with underscore
    return specialty.length > 0 && specialty[0] == '_';
}