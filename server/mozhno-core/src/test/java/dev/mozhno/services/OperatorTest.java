package dev.mozhno.services;

import org.junit.jupiter.api.Test;
import dev.mozhno.Operator;

import static org.junit.jupiter.api.Assertions.*;

class OperatorTest {

    @Test
    void isMulti_shouldReturnTrueForInAndNotIn() {
        assertTrue(Operator.isMulti("in"));
        assertTrue(Operator.isMulti("not_in"));
    }

    @Test
    void isMulti_shouldReturnFalseForSingleValueOps() {
        assertFalse(Operator.isMulti("eq"));
        assertFalse(Operator.isMulti("ne"));
        assertFalse(Operator.isMulti("gt"));
        assertFalse(Operator.isMulti("gte"));
        assertFalse(Operator.isMulti("lt"));
        assertFalse(Operator.isMulti("lte"));
        assertFalse(Operator.isMulti("contains"));
    }

    @Test
    void isMulti_shouldReturnFalseForNull() {
        assertFalse(Operator.isMulti(null));
    }

    @Test
    void isMulti_shouldReturnFalseForUnknown() {
        assertFalse(Operator.isMulti("bogus"));
    }

    @Test
    void fromValue_shouldResolveAllOperators() {
        assertEquals(Operator.IN, Operator.fromValue("in"));
        assertEquals(Operator.NOT_IN, Operator.fromValue("not_in"));
        assertEquals(Operator.EQ, Operator.fromValue("eq"));
        assertEquals(Operator.NE, Operator.fromValue("ne"));
        assertEquals(Operator.GT, Operator.fromValue("gt"));
        assertEquals(Operator.GTE, Operator.fromValue("gte"));
        assertEquals(Operator.LT, Operator.fromValue("lt"));
        assertEquals(Operator.LTE, Operator.fromValue("lte"));
        assertEquals(Operator.CONTAINS, Operator.fromValue("contains"));
    }

    @Test
    void fromValue_shouldReturnNullForNull() {
        assertNull(Operator.fromValue(null));
    }

    @Test
    void fromValue_shouldReturnNullForUnknown() {
        assertNull(Operator.fromValue("bogus"));
    }

    @Test
    void fromValue_shouldReturnNullForEmpty() {
        assertNull(Operator.fromValue(""));
    }

    @Test
    void getValue_shouldReturnCorrectStrings() {
        assertEquals("in", Operator.IN.getValue());
        assertEquals("not_in", Operator.NOT_IN.getValue());
        assertEquals("eq", Operator.EQ.getValue());
        assertEquals("ne", Operator.NE.getValue());
        assertEquals("gt", Operator.GT.getValue());
        assertEquals("gte", Operator.GTE.getValue());
        assertEquals("lt", Operator.LT.getValue());
        assertEquals("lte", Operator.LTE.getValue());
        assertEquals("contains", Operator.CONTAINS.getValue());
    }

    @Test
    void isMulti_instance_shouldMatchStatic() {
        assertTrue(Operator.IN.isMulti());
        assertTrue(Operator.NOT_IN.isMulti());
        assertFalse(Operator.EQ.isMulti());
        assertFalse(Operator.NE.isMulti());
        assertFalse(Operator.GT.isMulti());
        assertFalse(Operator.GTE.isMulti());
        assertFalse(Operator.LT.isMulti());
        assertFalse(Operator.LTE.isMulti());
        assertFalse(Operator.CONTAINS.isMulti());
    }
}
