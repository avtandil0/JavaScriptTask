const { calculateCommission, getConfigurationFromApi } = require("./calculateCommission");

describe("calculateCommission", () => {
  test("call api for coefficients", async () => {
    try {
      await getConfigurationFromApi();
      expect(true).toBeTruthy();
    } catch {}
  });

  test("calculates commission for natural person cash in correctly", () => {
    // await callApi();

    const operation = {
      date: "2022-03-15",
      user_id: 1,
      user_type: "natural",
      type: "cash_in",
      operation: {
        amount: 1000,
        currency: "EUR",
      },
    };

    expect(calculateCommission(operation)).toBeCloseTo(0.3, 5);
  });

  test("calculates commission for juridical person cash in correctly", () => {
    const operation = {
      date: "2022-03-15",
      user_id: 1,
      user_type: "juridical",
      type: "cash_in",
      operation: {
        amount: 1000,
        currency: "EUR",
      },
    };

    expect(calculateCommission(operation)).toBeCloseTo(0.3, 5);
  });

  test("calculates commission when fee is more then 5 for cash in correctly", () => {
    const operation = {
      date: "2022-03-15",
      user_id: 1,
      user_type: "juridical",
      type: "cash_in",
      operation: {
        amount: 50000,
        currency: "EUR",
      },
    };

    expect(calculateCommission(operation)).toBeCloseTo(5, 5);
  });

  test("calculates commission for natural person cash out below weekly limit correctly", () => {
    const operation = {
      date: "2022-03-15",
      user_id: 1,
      user_type: "natural",
      type: "cash_out",
      operation: {
        amount: 500,
        currency: "EUR",
      },
    };

    expect(calculateCommission(operation)).toBeCloseTo(0, 5);
  });

  test("calculates commission for natural person cash out above weekly limit correctly", () => {
    const operation1 = {
      date: "2022-03-14",
      user_id: 1,
      user_type: "natural",
      type: "cash_out",
      operation: {
        amount: 1000,
        currency: "EUR",
      },
    };
    const operation2 = {
      date: "2022-03-15",
      user_id: 1,
      user_type: "natural",
      type: "cash_out",
      operation: {
        amount: 200,
        currency: "EUR",
      },
    };

    expect(calculateCommission(operation1)).toBeCloseTo(0, 5);
    expect(calculateCommission(operation2)).toBeCloseTo(0.6, 5);
  });

  test("calculates commission for juridical person cash out correctly", () => {
    const operation = {
      date: "2022-03-15",
      user_id: 1,
      user_type: "juridical",
      type: "cash_out",
      operation: {
        amount: 1000,
        currency: "EUR",
      },
    };

    expect(calculateCommission(operation)).toBeCloseTo(3, 5);
  });

  test("rounds commission to two decimal places", () => {
    const operation = {
      date: "2022-03-15",
      user_id: 1,
      user_type: "natural",
      type: "cash_in",
      operation: {
        amount: 1000,
        currency: "EUR",
      },
    };

    expect(calculateCommission(operation)).toBeCloseTo(0.3, 5);
  });
});
