export function getNameFromPropCombo(
  flavorName: string,
  params?: { propCombo?: object }
) {
  return params && params.propCombo
    ? `${flavorName}-${Object.values(params.propCombo).join('x')}`
    : flavorName;
}
