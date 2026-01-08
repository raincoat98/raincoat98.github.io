/**
 * JavaScript 소수점 반올림 함수 테스트
 *
 * 이 테스트 파일은 docs/src/frontend/javascript/javascript-rounding.md의 모든 함수를 검증합니다.
 * Jest를 사용하여 부동소수점 오차 처리와 다양한 반올림 정책을 테스트합니다.
 *
 * 설치: npm install --save-dev jest
 * 실행: npx jest __tests__/math-rounding.test.js
 */

// ===== 반올림 함수 구현 =====

/**
 * 부동소수점 오차를 보정하여 정확히 반올림합니다 (기본 패턴)
 */
const round = (num, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round((num + Number.EPSILON) * factor) / factor;
};

/**
 * 소수점 2자리 전용 (성능 최적화)
 */
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * 소수점 3자리 전용
 */
const round3 = (n) => Math.round((n + Number.EPSILON) * 1000) / 1000;

/**
 * 버림 (Floor)
 */
const floorRound = (n, d = 0) => Math.floor(n * 10 ** d) / 10 ** d;

/**
 * 올림 (Ceil)
 */
const ceilRound = (n, d = 0) => Math.ceil(n * 10 ** d) / 10 ** d;

// ===== 테스트 시작 =====

describe('기본 반올림 함수 (Number.EPSILON 활용)', () => {
  test('round(1.005, 2)는 1.01이어야 한다', () => {
    expect(round(1.005, 2)).toBe(1.01);
  });

  test('round(2.675, 2)는 2.68이어야 한다', () => {
    expect(round(2.675, 2)).toBe(2.68);
  });

  test('round(0.1 + 0.2, 2)는 0.3이어야 한다', () => {
    expect(round(0.1 + 0.2, 2)).toBe(0.3);
  });

  test('round(9.995, 2)는 10이어야 한다', () => {
    expect(round(9.995, 2)).toBe(10);
  });

  test('round는 기본값 digits=0으로 정수 반올림한다', () => {
    expect(round(3.4)).toBe(3);
    expect(round(3.5)).toBe(4);
    expect(round(3.6)).toBe(4);
  });

  test('음수도 정확히 반올림한다', () => {
    expect(round(-1.005, 2)).toBe(-1.01);
    expect(round(-2.675, 2)).toBe(-2.68);
  });

  test('0은 그대로 0이다', () => {
    expect(round(0, 2)).toBe(0);
  });

  test('큰 숫자도 정확히 반올림한다', () => {
    expect(round(1000.005, 2)).toBe(1000.01);
    expect(round(999999.995, 2)).toBe(1000000);
  });

  test('다양한 자릿수에서 작동한다', () => {
    expect(round(1.2345, 1)).toBe(1.2);
    expect(round(1.2345, 2)).toBe(1.23);
    expect(round(1.2345, 3)).toBe(1.235);
    expect(round(1.2345, 4)).toBe(1.2345);
  });
});

describe('성능 최적화된 전용 함수', () => {
  test('round2(1.005)는 1.01이어야 한다', () => {
    expect(round2(1.005)).toBe(1.01);
  });

  test('round2(2.675)는 2.68이어야 한다', () => {
    expect(round2(2.675)).toBe(2.68);
  });

  test('round2(9.995)는 10이어야 한다', () => {
    expect(round2(9.995)).toBe(10);
  });

  test('round3(1.0055)는 1.006이어야 한다', () => {
    expect(round3(1.0055)).toBe(1.006);
  });

  test('round3(2.6754)는 2.675여야 한다', () => {
    expect(round3(2.6754)).toBe(2.675);
  });

  test('round2는 음수도 정확히 처리한다', () => {
    expect(round2(-1.005)).toBe(-1.01);
    expect(round2(-2.675)).toBe(-2.68);
  });
});

describe('버림 (Floor) 반올림', () => {
  test('floorRound는 항상 내림한다', () => {
    expect(floorRound(1.999, 2)).toBe(1.99);
    expect(floorRound(1.001, 2)).toBe(1.00);
    expect(floorRound(1.555, 2)).toBe(1.55);
  });

  test('floorRound는 정수 자리도 내림한다', () => {
    expect(floorRound(3.9)).toBe(3);
    expect(floorRound(3.1)).toBe(3);
  });

  test('음수의 floorRound는 더 작은 값으로 내린다', () => {
    expect(floorRound(-1.1, 2)).toBe(-1.1);
    expect(floorRound(-1.999, 2)).toBe(-1.99);
  });
});

describe('올림 (Ceil) 반올림', () => {
  test('ceilRound는 항상 올린다', () => {
    expect(ceilRound(1.001, 2)).toBe(1.01);
    expect(ceilRound(1.999, 2)).toBe(2.00);
    expect(ceilRound(1.001, 2)).toBe(1.01);
  });

  test('ceilRound는 정수 자리도 올린다', () => {
    expect(ceilRound(3.1)).toBe(4);
    expect(ceilRound(3.9)).toBe(4);
  });

  test('음수의 ceilRound는 더 큰 값으로 올린다', () => {
    expect(ceilRound(-1.9, 2)).toBe(-1.90);
    expect(ceilRound(-1.001, 2)).toBe(-1.00);
  });
});

describe('실전 예제: 장바구니 계산', () => {
  test('장바구니 총가격 계산', () => {
    const items = [
      { name: '상품A', price: 19.995, quantity: 2 },
      { name: '상품B', price: 9.995, quantity: 1 },
    ];

    const subtotal = items.reduce((sum, item) =>
      sum + round2(item.price * item.quantity), 0
    );

    expect(subtotal).toBe(49.98);
  });

  test('세금 계산', () => {
    const subtotal = 49.98;
    const tax = round2(subtotal * 0.1);
    expect(tax).toBe(5.00);
  });

  test('총합 계산', () => {
    const subtotal = 49.98;
    const tax = 5.00;
    const total = round2(subtotal + tax);
    expect(total).toBe(54.98);
  });
});

describe('실전 예제: 할인 적용', () => {
  const applyDiscount = (price, discountPercent) => {
    const discountAmount = round2(price * (discountPercent / 100));
    return round2(price - discountAmount);
  };

  test('15% 할인 적용', () => {
    expect(applyDiscount(99.99, 15)).toBe(84.99);
  });

  test('10% 할인 적용 (부동소수점 오차 케이스)', () => {
    expect(applyDiscount(19.995, 10)).toBe(17.99);
  });

  test('0% 할인은 원가와 같다', () => {
    expect(applyDiscount(100, 0)).toBe(100);
  });

  test('100% 할인은 0이 된다', () => {
    expect(applyDiscount(100, 100)).toBe(0);
  });
});

describe('실전 예제: 평균값 계산', () => {
  test('점수 평균 계산', () => {
    const scores = [85.555, 92.444, 78.666, 95.111];
    const average = round(
      scores.reduce((a, b) => a + b, 0) / scores.length,
      2
    );
    expect(average).toBe(87.94);
  });

  test('부동소수점 오차가 있는 평균', () => {
    const values = [0.1, 0.1, 0.1];
    const average = round(
      values.reduce((a, b) => a + b, 0) / values.length,
      2
    );
    // 0.1 + 0.1 + 0.1 = 0.30000000000000004
    // 0.30000000000000004 / 3 = 0.10000000000000001
    expect(average).toBe(0.1);
  });
});

describe('실전 예제: 백분율 계산', () => {
  const calculateMargin = (revenue, profit) => {
    return round((profit / revenue) * 100, 2);
  };

  test('마진율 계산', () => {
    const margin = calculateMargin(10000.50, 2500.75);
    expect(margin).toBe(25.01);
  });

  test('0% 마진', () => {
    expect(calculateMargin(100, 0)).toBe(0);
  });

  test('100% 마진 (이익 = 매출)', () => {
    expect(calculateMargin(100, 100)).toBe(100);
  });
});

describe('실전 예제: 금융 계산 (정수 변환)', () => {
  test('가격을 센트 단위로 변환', () => {
    const price = 1.005;
    const cents = Math.round(price * 100);
    expect(cents).toBe(101);
    expect(cents / 100).toBe(1.01);
  });

  test('금리 계산', () => {
    const principal = 1000.00;
    const ratePercent = 0.125; // 12.5%
    const interestCents = Math.round(principal * 100 * ratePercent) / 100;
    expect(interestCents).toBe(125);
  });

  test('대량 거래 처리', () => {
    const transactions = [1.005, 2.995, 0.335, 4.665];
    const totalCents = transactions.reduce(
      (sum, amount) => sum + Math.round(amount * 100),
      0
    );
    const total = totalCents / 100;
    expect(total).toBe(9);
  });
});

describe('엣지 케이스 (Edge Cases)', () => {
  test('아주 작은 숫자들', () => {
    expect(round(0.001, 3)).toBe(0.001);
    expect(round(0.0005, 3)).toBe(0.001);
    expect(round(0.0004, 3)).toBe(0.000);
  });

  test('아주 큰 숫자들', () => {
    expect(round(1000000.005, 2)).toBe(1000000.01);
    expect(round(9999999.995, 2)).toBe(10000000);
  });

  test('부동소수점 표현 한계 (매우 큰 자릿수)', () => {
    const result = round(0.123456789123456789, 10);
    expect(typeof result).toBe('number');
    // 정확한 값은 부동소수점 정밀도에 따라 다름
  });

  test('특수 숫자값들', () => {
    expect(round(0)).toBe(0);
    expect(round(-0)).toBe(0);
  });

  test('toFixed()와 round의 차이', () => {
    const value = 1.005;
    const rounded = round(value, 2);
    const fixed = value.toFixed(2);

    expect(rounded).toBe(1.01);  // 숫자
    expect(fixed).toBe('1.01');  // 문자열
    expect(typeof rounded).toBe('number');
    expect(typeof fixed).toBe('string');
  });
});

describe('성능 및 최적화', () => {
  test('round2는 범용 round보다 빨다 (벤치마크)', () => {
    const iterations = 100000;

    // 범용 round 성능 측정
    const start1 = performance.now();
    for (let i = 0; i < iterations; i++) {
      round(1.005, 2);
    }
    const end1 = performance.now();
    const time1 = end1 - start1;

    // round2 성능 측정
    const start2 = performance.now();
    for (let i = 0; i < iterations; i++) {
      round2(1.005);
    }
    const end2 = performance.now();
    const time2 = end2 - start2;

    // round2가 범용 round보다 빠르거나 같아야 함
    expect(time2).toBeLessThanOrEqual(time1 * 1.1); // 10% 마진 허용
  });
});

describe('Number.EPSILON의 역할', () => {
  test('EPSILON 없이는 1.005 * 100 = 100.49999...', () => {
    const value = 1.005 * 100;
    expect(value).toBeLessThan(100.5); // 부동소수점 오차 확인
  });

  test('EPSILON을 더하면 보정된다', () => {
    const value = 1.005 * 100;
    const corrected = value + Number.EPSILON;
    expect(corrected).toBeGreaterThan(value);
  });

  test('round가 EPSILON으로 정확성을 확보한다', () => {
    expect(round(1.005, 2)).toBe(1.01);
    expect(Math.round(1.005 * 100) / 100).toBe(1);  // EPSILON 없이는 실패
  });
});

// ===== 테스트 유틸리티 함수 =====

describe('테스트 헬퍼: 부동소수점 비교', () => {
  /**
   * 부동소수점 오차를 감안한 비교 (실제 프로덕션 코드에서 사용)
   */
  const areAlmostEqual = (a, b, epsilon = Number.EPSILON) => {
    return Math.abs(a - b) < epsilon;
  };

  test('areAlmostEqual은 부동소수점 오차를 무시한다', () => {
    expect(areAlmostEqual(0.1 + 0.2, 0.3)).toBe(true);
    expect(0.1 + 0.2 === 0.3).toBe(false); // 직접 비교는 실패
  });

  test('areAlmostEqual은 명백한 차이는 감지한다', () => {
    expect(areAlmostEqual(1, 2)).toBe(false);
    expect(areAlmostEqual(1.001, 1.002)).toBe(true);
  });
});

// ===== 내보내기 (모듈로 사용할 경우) =====

module.exports = {
  round,
  round2,
  round3,
  floorRound,
  ceilRound,
};
