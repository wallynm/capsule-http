/* global it describe*/

import Calculator from './index';
import { expect } from 'chai';

describe('Add functionality test', () => {
    it('add(2,3) should returns 5', () => {
        let calc = new Calculator();
        expect(calc.add(2,3)).to.be.equal(5);
    });
});