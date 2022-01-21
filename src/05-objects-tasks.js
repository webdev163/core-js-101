/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea() {
      return width * height;
    },
  };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  Object.setPrototypeOf(obj, proto);
  return obj;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

const countError = 'Element, id and pseudo-element should not occur more then one time inside the selector" if element, id or pseudo-element occurs twice or more times';

const orderError = 'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element';

class Selector {
  constructor() {
    this.string = '';
    this.current = new Array(6).fill(false);
  }

  element(value) {
    this.string += value;
    this.current[0] = !this.current[0] ? 1 : this.current[0] += 1;
    if (this.current[0] > 1) throw new Error(countError);
    if (this.current.slice(-5).filter((el) => el !== false).length) throw new Error(orderError);
    return this;
  }

  id(value) {
    this.string += `#${value}`;
    this.current[1] = !this.current[1] ? 1 : this.current[1] += 1;
    if (this.current[1] > 1) throw new Error(countError);
    if (this.current.slice(-4).filter((el) => el !== false).length
    && this.current.slice(0, 1).filter((el) => el === false).length) throw new Error(orderError);
    return this;
  }

  class(value) {
    this.string += `.${value}`;
    this.current[2] = !this.current[2] ? 1 : this.current[2] += 1;
    if (this.current.slice(-3).filter((el) => el !== false).length
    && this.current.slice(0, 2).filter((el) => el === false).length) throw new Error(orderError);
    return this;
  }

  attr(value) {
    this.string += `[${value}]`;
    this.current[3] = !this.current[3] ? 1 : this.current[3] += 1;
    if (this.current.slice(-2).filter((el) => el !== false).length
    && this.current.slice(0, 3).filter((el) => el === false).length) throw new Error(orderError);
    return this;
  }

  pseudoClass(value) {
    this.string += `:${value}`;
    this.current[4] = !this.current[4] ? 1 : this.current[4] += 1;
    if (this.current.slice(-1).filter((el) => el !== false).length
    && this.current.slice(0, 4).filter((el) => el === false).length) throw new Error(orderError);
    return this;
  }

  pseudoElement(value) {
    this.string += `::${value}`;
    this.current[5] = !this.current[5] ? 1 : this.current[5] += 1;
    if (this.current[5] > 1) throw new Error(countError);
    return this;
  }

  stringify() {
    return this.string;
  }
}

const cssSelectorBuilder = {
  element(value) {
    return new Selector().element(value);
  },

  id(value) {
    return new Selector().id(value);
  },

  class(value) {
    return new Selector().class(value);
  },

  attr(value) {
    return new Selector().attr(value);
  },

  pseudoClass(value) {
    return new Selector().pseudoClass(value);
  },

  pseudoElement(value) {
    return new Selector().pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    const left = selector1.stringify();
    const right = selector2.stringify();
    const result = `${left} ${combinator} ${right}`;
    return new Selector().element(result);
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
