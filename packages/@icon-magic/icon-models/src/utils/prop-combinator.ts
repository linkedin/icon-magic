/**
 * @Bryan Levay's prop combinator
 * Gets the cross-product of specified properties and values.
 *
 * For input like:
 * {
 *   prop1: ['valueA', 'valueB'],
 *   prop2: ['valueX', 'valueY'],
 * }
 *
 * you will get output like:
 *
 * [
 *   { prop1: 'valueA', prop2: 'valueX' },
 *   { prop1: 'valueB', prop2: 'valueX' },
 *   { prop1: 'valueA', prop2: 'valueY' },
 *   { prop1: 'valueB', prop2: 'valueY' },
 * ]
 *
 * @param props - A map of propname to Array of possible values.
 * @returns an array of all possible combinations of the properties
 */
export function propCombinator(props: {}) {
  let results = [{}];
  // for each prop and it's potential values...
  Object.keys(props).forEach(propName => {
    const currentValuesArr = props[propName];
    // we don't want to change `results` while iterating over it,
    // so stash work for this prop in `temp`
    const temp: {}[] | {}[] = [];
    // ...iterate through the current set of results...
    results.forEach(res => {
      // ...and iterate through all the possible values for the current prop...
      currentValuesArr.forEach((val: any) => {
        // ...then create a new object from the previously existing result
        // and add a new key/val pair for the current prop
        temp.push({ [propName]: val, ...res });
      });
    });
    // un-stash the work in progress.
    results = temp;
  });
  return results;
}

export function getNameFromPropCombo(
  flavorName: string,
  params?: { propCombo?: object }
) {
  return params && params.propCombo
    ? `${flavorName}-${Object.values(params.propCombo).join('x')}`
    : flavorName;
}
