# Chapter 1 리팩터링: 첫 번째 예시

- [리팩터링의 첫 단계](#리팩터링의-첫-단계)
- [함수 쪼개기](#함수-쪼개기)
- [계산 단계와 포매팅 단계 분리하기](#계산-단계와-포매팅-단계-분리하기)
- [중간 점검](#중간-점검)
- [다형성을 활용해 계산 코드 재구성하기](#다형성을-활용해-계산-코드-재구성하기)

> 프로그램이 새로운 기능을 추가하기에 편한 구조가 아니라면, 먼저 기능을 추가하기 쉬운 형태로 리팩터링하고 나서 원하는 기능을 추가한다.

> 리팩터링이 필요한 이유는 변경 때문이다. 잘 작동하고 나중에 변경할 일이 절대 없다면 코드를 현재 상태로 나둬도 아무런 문제가 없다. 하지만 다른 사람이 읽고 이해해야 할 일이 생겼는데 로직을 파악하기 어렵다면 뭔가 대책을 마련해야 한다.

## 리팩터링의 첫 단계

리팩터링의 첫 단계는 **테스트 코드**를 작성하는 것이다. 우리 예제의 `statement()` 함수의 테스트 코드는 공연 종류에 따라 다른 문자열을 반환하므로 다양한 장르의 공연들로 구성된 공연료 청구서 몇 개를 문자열 형태로 준비해두고, `statement()` 함수가 반환한 문자열과 정답 문자열을 비교하면 된다. 그리고 이 테스트를 단축키 하나로 실행할 수 있도록 설정해두면 끝이다.

여기서 중요한 부분은 테스트의 결과를 보고하는 방식이다. 출력된 문자열이 정답 문자열과 똑같다면 테스트를 통과했다는 의미의 초록불을 켜고, 조금이라도 다르면 실패를 뜻하는 빨간불을 켠다. 성공/실패를 판단하는 자가진단 테스트를 만들어야 하는 것이 가장 중요하다.

> 리팩터링하기 전에 제대로 된 테스트부터 마련한다. 테스트는 반드시 자가진단하도록 만든다.

테스트를 작성하는 데 시간이 걸리지만 잘 만든 테스트 코드는 디버깅 시간을 줄여줘서 전체 작업 시간을 단축시킨다. 리팩터링에서 테스트의 역할은 굉장히 중요하다!

## 함수 쪼개기

`statement()` 처럼 긴 함수를 리팩터링할 때는 먼저 전체 동작을 각각의 부분으로 나눌 수 있는 지점을 찾는다. 우리의 `statement()` 함수에서는 `switch` 문을 보면 공연에 대한 요금을 계산하고 있는데 이 내용은 코드를 읽어보아야 알 수 있는 내용이다. 이를 **함수로 추출**하면 다음번에는 코드를 읽지 않고 이름만 보고 어떤 내용을 하는지 이해할 수 있게 된다.

함수로 추출할 때는 **유효범위를 벗어나는 변수가 있는지 확인**해야 한다. `switch` 문 내에서는 `thisAmount`, `perf`, `play`가 유효범위를 벗어나는 변수에 속한다. `perf`와 `play`는 값을 변경하지 않기 때문에 매개변수로 전달하면 되지만 `thisAmount`는 값이 변경되므로 조심해서 다뤄야 한다. 이번에는 이런 변수가 하나뿐이므로 `thisAmount` 값을 반환하는 `amountFor()` 함수를 만들었다.

```javascript
function amountFor(perf, play) {
  let thisAmount = 0;
  switch (play.type) {
    case 'tragedy':
      thisAmount = 40000;
      if (perf.audience > 30) {
        thisAmount += 1000 * (perf.audience - 30);
      }
      break;
    case 'comedy':
      thisAmount = 30000;
      if (perf.audience > 20) {
        thisAmount += 10000 + 500 * (perf.audience - 20);
      }
      thisAmount += 300 * perf.audience;
      break;
    default:
      throw new Error(`알 수 없는 장르: ${play.type}`);
  }

  return thisAmount;
}
```

`statement()` 함수에서 기존 `switch` 문 대신 `let thisAmount = amountFor(perf, play)`로 대체했다. 그리고 수정 후에는 테스트를 해서 실수한 게 없는지 확인한다. 아무리 간단한 수정이라도 리팩터링 후에는 항상 테스트하는 습관을 들이는 것이 바람직하다. **조금씩 변경하고 매번 테스트하는 것이 리팩터링 절차의 핵심이다.**

> 리팩터링은 프로그램 수정을 작은 단계로 나눠 진행한다. 그래서 중간에 실수하더라도 버그를 쉽게 찾을 수 있다.

테스트를 해보니 문제없는 것을 확인했다. 하나의 리팩터링을 문제없이 끈낼 때마다 커밋한다. 그래야 중간에 문제가 생기더라도 이전의 정상 상태로 쉽게 돌아갈 수 있다.

함수를 추출하고 나면 추출된 함수 코드를 자세히 들여다보면서 지금보다 명확하게 표현할 수 있는 간단한 방법은 없는지 검토한다. 가장 먼저 변수의 이름을 더 명확하게 바꿔보자. `thisAmount`를 `result`로 수정하자. 수정 후에는 당연히 테스트하고 커밋하자.

그리고 함수의 첫 번째 인수인 `perf` 를 `aPerformance`로 바꾸자. **자바스크립트와 같은 동적 타입 언어를 사용할 때는 타입이 드러나게 작성하면 도움이 된다.** 매개변수 이름에 접두어로 타입 이름을 적는 것을 추천한다. 지금처럼 매개변수의 역할이 뚜렷하지 않을 때는 부정 관사(a/an)을 붙인다.

> 컴퓨터가 이해하는 코드는 바보도 작성할 수 있다. 사람이 이해하도록 작성하는 프로그래머가 진정한 실력자다.

---

다음으로 `amountFor()` 함수의 `play`가 꼭 필요한지 살펴보자. `play` 값은 사실 `aPerformance`에서 얻기 때문에 애초에 매개변수로 전달할 필요가 없다. 긴 함수를 잘게 쪼갤 때마다 `play` 같은 변수를 최대한 제거하는 것이 좋다. 이런 임시 변수들 때문에 로컬 범위에 존재하는 이름이 늘어나서 추출 작업이 복잡해지기 때문이다. 이를 해결해주는 리팩터링으로는 **임시 변수를 질의 함수로 바꾸기**가 있다.

일단 `statement()` 내의 `const play = plays[perf.playID]`의 우변을 함수로 추출하자.

```javascript
function playFor(aPerformance) {
  return plays[aPerformance.playID];
}
```

- 주의해야할 점은 `plays`를 사용하기 때문에 `statement()` 함수 안에서 중첩 함수로 선언해야 한다는 점이다. 밖에서 `playFor()` 함수를 선언하려면 `plays`를 매개변수로 넣어주어야 한다.

이후 `const play = playFor(perf)`로 변경하고 테스트하고 문제가 없는 것을 확인하고 커밋하자.

이제 여기서부터 **변수 인라인하기**를 적용하자. 변수 인라인하기는 임시 변수 대신 함수를 사용하는 것이다. `play`가 있는 곳을 `playFor(perf)`로 모두 변경하자. 그리고 테스트한 후 문제가 없다면 `play` 변수를 마지막으로 제거하고 테스트하고 커밋하자.

이번엔 `amountFor()` 함수 내의 `play` 를 `playFor(aPerformance)`로 변경하고 테스트하고 최종적으로 `play` 매개변수를 제거하자.

```javascript
function amountFor(aPerformance) {
  let result = 0;
  switch (playFor(aPerformance).type) {
    case 'tragedy':
      result = 40000;
      if (aPerformance.audience > 30) {
        result += 1000 * (aPerformance.audience - 30);
      }
      break;
    case 'comedy':
      result = 30000;
      if (aPerformance.audience > 20) {
        result += 10000 + 500 * (aPerformance.audience - 20);
      }
      result += 300 * aPerformance.audience;
      break;
    default:
      throw new Error(`알 수 없는 장르: ${playFor(aPerformance).type}`);
  }

  return result;
}
```

- `amoutFor()` 함수에서 `playFor()` 함수를 사용해야 하므로 `amountFor()` 함수를 `statement()` 함수의 중첩 함수로 선언해야 한다.

방금 수행한 리팩터링에서 주목할 점이 몇가지 있다. 이전 코드는 루프를 한 번 돌 때마다 공연을 조회했는데 반해 리팩터링한 코드에서는 세 번이나 조회한다. 일단 지금은 성능에 큰 영향은 없지만 이후 리팩터링과 성능의 관계에 대해서 알아보아야 할 필요가 있다. 그리고 느려지더라도 제대로 리팩터링된 코드베이스에서는 그렇지 않은 코드보다 성능을 개선하기가 훨씬 수월하다.

지역 변수를 제거해서 얻는 가장 큰 장점은 유효범위를 신경써야 할 대상이 줄어들기 때문에 추출 작업이 훨씬 쉬워진다는 것이다.

이제 `amountFor()` 함수의 리턴 값을 담는 `thisAmount` 변수를 보자. `thisAmount`는 그 값이 다시 바뀌지 않기 때문에 이것도 변수 인라인하기를 적용해보자. 테스트 해보니 정상적으로 동작하므로 이를 커밋하자.

---

앞서서 `play` 변수를 제거한 결과 로컬 유효범위의 변수가 하나 줄어서 적립 포인트 계산 부분을 추출하기가 훨씬 쉬워졌다.

적립 포인트를 계산할 때 사용하는 변수는 `perf`와 `volumeCredits`이다. `perf`는 값을 사용하기만하고 변경하지 않으니 매개변수로 전달하면 된다. 하지만 `volumeCredits`는 반복문을 돌 때마다 값을 누적해야 하기 때문에 살짝 까다롭다. 이 상황에서의 최선의 방법은 추출한 함수에서 `volumeCredits`의 복제본을 초기화한 뒤 계산 결과를 반환토록 작성하는 것이다.

```javascript
function volumeCreditsFor(aPerformance) {
  let result = 0;
  result += Math.max(aPerformance.audience - 30, 0);
  if (playFor(aPerformance).type === 'comedy') {
    result += Math.floor(aPerformance.audience / 5);
  }
  return result;
}
```

이번 역시 `statement()` 함수의 중첩 함수로 선언했다. 이유는 당연히 `playFor()` 함수를 사용하기 때문이다. 그리고 `volumeCreditsFor()` 함수 내에서는 `perf`, `volumeCredits` 대신 `aPerformance`와 `result`를 사용했다.

---

앞서 설명했듯이 임시 변수는 나중에 문제를 일으킬 수 있다. 임시 변수는 자신이 속한 루틴에서만 의미가 있어서 루틴이 길고 복잡해지기 쉽다. 따라서 다음으로 할 리팩터링은 이런 변수들을 제거하는 것이다. 그중에서 가장 만만해 보이는 것이 `format`이다. `format`은 임시 변수에 함수를 대입한 형태인데 함수를 직접 선언해 사용하는 형태로 바꾸어보자.

```javascript
function format(aNumber) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(
    aNumber,
  );
}
```

테스트 결과 제대로 동작하므로 커밋을 했다. 그런데 `format`이란 이름은 이 함수가 하는 일을 충분히 설명해주지 못한다. 그렇다고 `formatAsUSD`라고 하기에는 또 너무 장황하다. 이 함수의 핵심은 화폐 단위 맞추기다. 그래서 그런 느낌을 살리는 이름을 골라서 **함수 선언 바꾸기**를 적용하자.

```javascript
function usd(aNumber) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(
    aNumber / 100,
  );
}
```

함수 이름을 `usd`로 변경하고 100으로 나누는 코드도 추출한 함수로 옮겼다. 긴 함수를 작게 쪼개는 리팩터링은 이름을 잘 지어야만 효과가 있다. 이름이 좋으면 함수 본문을 읽지 않고도 무슨 일을 하는지 알 수 있다. 물론 단번에 좋은 이름을 짓기는 쉽지 않다. 따라서 처음에는 당장 떠오르는 최선의 이름을 사용하다가, 나중에 더 좋은 이름이 떠오를 때 바꾸는 식이 좋다. 흔히 코드를 두 번 이상 읽고 나서야 가장 적합한 이름이 떠오르곤 한다.

---

이제는 이전에 `volumeCreditsFor()` 함수로 추출했지만 여전히 남아있는 `volumeCredits` 임시 변수를 제거해보자. 이 부분은 [반복문 쪼개기] [문장 슬라이드하기] [함수로 추출하기] [임시 변수를 질의 함수로 바꾸기] 네 단계로 나눠서 진행해보자.

- 반복문 쪼개기

  ```javascript
  // 반복문 쪼개기 전
  for (let perf of invoice.performances) {
    volumeCredits += volumeCreditsFor(perf);

    result += `  ${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience}석)\n`;
    totalAmount += amountFor(perf);
  }

  // 반복문 쪼개기 후
  for (let perf of invoice.performances) {
    result += `  ${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience}석)\n`;
    totalAmount += amountFor(perf);
  }
  for (let perf of invoice.performances) {
    volumeCredits += volumeCreditsFor(perf);
  }
  ```

  한 개의 반복문을 두 개로 쪼개면 함수로 더 쉽게 추출할 수 있다.

- 문장 슬라이드하기

  아래 쪼갠 반복문에서 사용하는 `volumeCredits` 변수를 반복문 바로 위에서 선언한다.

  ```javascript
  let volumeCredits = 0;
  for (let perf of invoice.performances) {
    volumeCredits += volumeCreditsFor(perf);
  }
  ```

- 함수 추출하기

  ```javascript
  function totalVolumeCredits() {
    let volumeCredits = 0;
    for (let perf of invoice.performances) {
      volumeCredits += volumeCreditsFor(perf);
    }
    return volumeCredits;
  }
  ```

- 변수 인라인하기

  기존의 `volumeCredits` 변수를 제거하고 이를 사용하는 곳 `totalVolumeCredits()` 함수로 인라인

  ```javascript
  result += `적립 포인트: ${totalVolumeCredits()}\n`;
  ```

> 지금까지 한 부분에 대해서 조금 생각해 볼 필요가 있다. 일단 반복문을 두번 돌기 때문에 성능이 느려지지 않을까 걱정할 수 있다. 하지만 이정도 중복은 성능에 미치는 영향이 미미할 때가 많다. 실제로 이번 리팩터링 전과 후의 실행 시간을 측정해보면 차이를 거의 느끼지 못할 것이다. 똑똑한 컴파일러들은 최신 캐싱 기법 등으로 뭊아하고 있어서 우리의 직관을 초월하는 결과를 내어준다. 또한 소프트웨어 성능은 대체로 코드의 몇몇 작은 부분에 의해 결정되므로 그 외의 부분은 수정한다고 해도 성능 차이를 체감할 수 없다. <br />
> 하지만 '대체로 그렇다'와 '항상 그렇다'는 엄연히 다르다. 때로는 리팩터링이 성능에 상당한 영향을 주기도 한다. 하지만 저자는 그런 경우라도 개의치 않고 리팩터링 한다. **잘 다듬어진 코드라야 성능 개선 작업도 훨씬 수월하기 때문이다.** 리팩터링 과정에서 성능이 크게 떨어졌다면 리팩터링 후 시간을 내어 성능을 개선한다. 이 과정에서 리팩터링된 코드를 예전으로 되돌리는 경우도 있지만, 대체로 리팩터링 덕분에 성능 개선을 더 효과적으로 수행할 수 있다. 결과적으로 더 깔끔하면서 더 빠른 코드를 얻게 된다. <br />
> 따라서 리팩터링으로 인한 성능 문제에 대한 저자의 조언은 '**특별한 경우가 아니라면 일단 무시하라**'이다. 리팩터링으로 인해 성능이 떨어진다면 리팩터링을 마무리하고 성능을 개선하자.

---

`totalAmount` 변수도 이전의 `volumeCredits` 변수를 인라인 한 것 처럼 인라인해보자. 일단 반복문을 쪼개고, `totalAmount` 선언하는 문장을 슬라이드하자. 그리고 별도의 함수로 추출하고(`totalAmount()` 함수로 추출하는 것이 가장 좋으나 이미 `totalAmount` 변수를 사용하고 있으므로 의미없는 다른 이름으로 일단 지음) 마지막으로 변수를 인라인하면된다.

## 계산 단계와 포매팅 단계 분리하기

함수를 쪼개는 과정은 리팩터링 초기 단계에서 흔히 수행하는 프로그램의 논리적인 요소를 파악하기 쉽도록 코드의 구조를 보강하는 작업이다.

골격은 개선됐으니 이제 원하던 기능 변경, 즉 `statement()`의 HTML 버전을 만드는 작업을 살펴보자. 여러 각도에서 볼 때 확실히 처음 코드보다 작업하기 편해졌지만 분리된 계산 함수들이 텍스트 버전인 `statement()` 안에 중첩 함수로 들어가 있어서 HTML 버전을 만들려면 모든 함수들을 복사해서 붙이는 방식으로 만들어야 한다.

텍스트 버전과 HTML 버전을 모두 같은 계산 함수를 사용하게 만들기 위해서 **단계 쪼개기**를 하자. 목표는 `statement()`의 로직을 두 단계로 나누는 것이다. 첫 단계는 `statement()`에 필요한 데이터를 처리하고, 다음 단계에서 앞서 처리한 결과를 텍스트나 HTML로 표현하도록 하자.

단계를 쪼개려면 먼저 두 번째 단계가 될 코드들을 함수 추출하기로 뽑아내야 한다. 이 예에서 두 번째 단계는 청구 내역을 출력하는 코드인데 현재는 `statement()`의 본문 전체가 여기에 해당한다. `statement()` 함수의 전체 내용을 `renderPlainText()` 함수로 이동시키고 `statement()` 함수는 `renderPlainText()`를 반환하는 함수로 수정하고 테스트에 통과하면 커밋하자.

```javascript
function statement(invoice, plays) {
  return renderPlainText(invoice, plays);
}

function renderPlainText(invoice, plays) {
  // 이전 statement 함수에 있던 모든 내용들
}
```

이제 두 단계의 중간 데이터 구조 역할을 할 객체를 `statement()` 함수에서 만들고, `renderPlainText()` 함수의 인수로 전달하자.

```javascript
function statement(invoice, plays) {
  const statementData = {};
  return renderPlainText(statementData, invoice, plays);
}

function renderPlainText(data, invoice, plays) {
  // 이전 statement 함수에 있던 모든 내용들
}
```

이제 `renderPlainText()`의 `invoice`와 `plays`를 통해 전달되는 데이터를 `statementData`로 옮기면 계산 관련 코드는 전부 `statement()` 함수로 모으고 `renderPlainText()`는 `data` 매개변수로 전달된 데이터만 처리하게 만들 수 있다.

가장 먼저 고객 정보(`invoice.customer`)부터 중간 데이터 구조로 옮기자.

```javascript
function statement(invoice, plays) {
  const statementData = {};
  statementData.customer = invoice.customer;
  return renderPlainText(statementData, invoice, plays);
}

function renderPlainText(data, invoice, plays) {
  let result = `청구 내역 (고객명: ${data.customer})\n`;
  // ...
}
```

다음으로는 공연 정보(`invoice.performances`)를 중간 데이터 구조로 옮기자. 그리고 `renderPlainText()` 함수에서 `invoice.performances`를 사용하는 부분을 `data.performances`로 변경하면 `invoice` 매개변수를 삭제할 수 있다.

```javascript
function statement(invoice, plays) {
  const statementData = {};
  statementData.customer = invoice.customer;
  statementData.performances = invoice.performances;
  return renderPlainText(statementData, plays);
}
```

이제는 `renderPlainText()` 함수의 `plays` 매개변수를 `data`로 대체해보자. 일단 **함수 옮기기**를 적용해 `playFor()` 함수를 `statement()` 함수로 옮기고 `renderPlainText()` 함수 내에서 `playFor()` 함수를 호출하던 부분을 중간 데이터(`aPerformance.play`)를 사용하도록 바꾸자.

```javascript
function statement(invoice, plays) {
  const statementData = {};
  statementData.customer = invoice.customer;
  statementData.performances = invoice.performances.map(enrichPerformance);
  return renderPlainText(statementData, plays);

  function enrichPerformance(aPerformance) {
    const result = { ...aPerformance };
    result.play = playFor(result);
    return result;
  }

  function playFor(aPerformance) {
    return plays[aPerformance.playID];
  }
}
```

이어서 `amountFor()` 함수도 `statement()` 내부로 옮기자.

```javascript
function statement(invoice, plays) {
  const statementData = {};
  statementData.customer = invoice.customer;
  statementData.performances = invoice.performances.map(enrichPerformance);
  return renderPlainText(statementData, plays);

  function enrichPerformance(aPerformance) {
    const result = { ...aPerformance };
    result.play = playFor(result);
    result.amount = amountFor(result);
    return result;
  }

  function playFor(aPerformance) {
    return plays[aPerformance.playID];
  }

  function amountFor(aPerformance) {
    let result = 0;
    switch (aPerformance.play.type) {
      case 'tragedy':
        result = 40000;
        if (aPerformance.audience > 30) {
          result += 1000 * (aPerformance.audience - 30);
        }
        break;
      case 'comedy':
        result = 30000;
        if (aPerformance.audience > 20) {
          result += 10000 + 500 * (aPerformance.audience - 20);
        }
        result += 300 * aPerformance.audience;
        break;
      default:
        throw new Error(`알 수 없는 장르: ${aPerformance.play.type}`);
    }

    return result;
  }
}
```

다음으로 적립 포인트를 계산하는 부분(`volumeCreditsFor()`)을 옮기자.

```javascript
function statement(invoice, plays) {
  // ...

  function enrichPerformance(aPerformance) {
    const result = { ...aPerformance };
    result.play = playFor(result);
    result.amount = amountFor(result);
    result.volumeCredits = volumeCreditsFor(result);
    return result;
  }

  // ...

  function volumeCreditsFor(aPerformance) {
    let result = 0;
    result += Math.max(aPerformance.audience - 30, 0);
    if (aPerformance.play.type === 'comedy') {
      result += Math.floor(aPerformance.audience / 5);
    }
    return result;
  }
}
```

마지막으로 총합을 구하는 부분(`totalAmount()`, `totalVolumeCredits()`)을 옮기자.

```javascript
function statement(invoice, plays) {
  const statementData = {};
  statementData.customer = invoice.customer;
  statementData.performances = invoice.performances.map(enrichPerformance);
  statementData.totalAmount = totalAmount(statementData);
  statementData.totalVolumeCredits = totalVolumeCredits(statementData);
  return renderPlainText(statementData, plays);

  function enrichPerformance(aPerformance) {
    const result = { ...aPerformance };
    result.play = playFor(result);
    result.amount = amountFor(result);
    result.volumeCredits = volumeCreditsFor(result);
    return result;
  }

  function playFor(aPerformance) {
    return plays[aPerformance.playID];
  }

  function amountFor(aPerformance) {
    let result = 0;
    switch (aPerformance.play.type) {
      case 'tragedy':
        result = 40000;
        if (aPerformance.audience > 30) {
          result += 1000 * (aPerformance.audience - 30);
        }
        break;
      case 'comedy':
        result = 30000;
        if (aPerformance.audience > 20) {
          result += 10000 + 500 * (aPerformance.audience - 20);
        }
        result += 300 * aPerformance.audience;
        break;
      default:
        throw new Error(`알 수 없는 장르: ${aPerformance.play.type}`);
    }

    return result;
  }

  function volumeCreditsFor(aPerformance) {
    let result = 0;
    result += Math.max(aPerformance.audience - 30, 0);
    if (aPerformance.play.type === 'comedy') {
      result += Math.floor(aPerformance.audience / 5);
    }
    return result;
  }

  function totalAmount(data) {
    let result = 0;
    for (let perf of data.performances) {
      result += perf.amount;
    }
    return result;
  }

  function totalVolumeCredits(data) {
    let result = 0;
    for (let perf of data.performances) {
      result += perf.volumeCredits;
    }
    return result;
  }
}
```

`totalAmount()`와 `totalVolumeCredits()`의 경우 `statementData` 변수가 유효범위에 있음에도 명확히 매개변수로 전달하는 것을 선호해 매개변수가 있는 함수로 수정했다.

이후 `totalAmount()`와 `totalVolumeCredits()` 함수 내부의 **반복문을 파이프라인으로 바꾸기**를 적용했다.

```javascript
function totalAmount(data) {
  return data.performances.reduce((total, p) => total + p.amount, 0);
}

function totalVolumeCredits(data) {
  return data.performances.reduce((total, p) => total + p.volumeCredits, 0);
}
```

이제 `statement()`에 필요한 데이터 처리에 해당하는 코드를 모두 별도 함수로 빼낸다.

```javascript
function statement(invoice, plays) {
  return renderPlainText(createStatementData(invoice, plays));
}

function createStatementData(invoice, plays) {
  // 데이터 처리에 해당하는 코드 및 함수들
}
```

이제 두 단계가 명확하게 분리(`renderPlainText()`와 `createStatementData()`)됐다. 이제 `createStatementData()` 함수를 외부 파일로 분리하자.

이제 HTML 버전을 추가할 수 있다.

```javascript
function renderHtml(data) {
  let result = `<h1>청구 내역 (고객명: ${data.customer})</h1>\n`;
  result += '<table>\n';
  result += '<tr><th>연극</th><th>좌석 수</th><th>금액</th></tr>';
  for (let perf of data.performances) {
    result += `  <tr><td>${perf.play.name}</td><td>(${perf.audience}석)</td>`;
    result += `<td>${usd(perf.amount)}</td></tr>\n`;
  }
  result += '</table>\n';
  result += `<p>총액: <em>${usd(data.totalAmount)}</em></p>\n`;
  result += `<p>적립 포인트: <em>${data.totalVolumeCredits}</em>점</p>\n`;
  return result;
}

function usd(aNumber) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(
    aNumber / 100,
  );
}
```

HTML 버전에서도 `usd()`를 사용하기 위해 밖으로 뺐고, 어렵지 않게 `renderHtml()` 함수를 추가했다.

## 중간 점검

처음보다 코드량이 부쩍 늘어났다. 늘어난 주된 원인은 함수로 추출하면서 함수 본문을 열고 닫는 괄호가 덧붙었기 때문이다. 그 외에 달라진 점이 없다면 안좋은 징조지만, 다행히 전체 로직을 구성하는 각 요소들이 더 뚜렷이 부각되고, 계산하는 부분과 출력 형식을 다루는 부분이 분리됐다. 이렇게 모듈화하면 각 부분이 하는 일과 그 부분들이 맞물려 돌아가는 과정을 파악하기 쉬워진다. 프로그래밍에서만큼은 명료함이 진화할 수 있는 소프트웨어의 정수다. 모듈화한 소프트웨어 덕분에 계산 코드를 중복하지 않고도 HTML 버전을 만들 수 있었다.

> 캠핑자들에게는 "도착했을 때보다 깔끔하게 정돈하고 떠난다"는 규칙이 있다. 프로그래밍도 마찬가지다. 항시 코드베이스를 작업 시작 전보다 건강하게 만들어놓고 떠나야 한다.

## 다형성을 활용해 계산 코드 재구성하기

이번에는 연극 장르를 추가하고 장르마다 공연료와 포인트 계산법을 다르게 지정하도록 기능을 수정해보자. 현재 상태에서 코드를 변경하려면 이 계산을 수행하는 함수에서 조건문을 수정해야 한다. `amountFor()` 함수를 보면 연극 장르에 따라 계산 방식이 달라진다는 사실을 알 수 있는데, 이런 형태의 조건부 로직은 코드 수정 횟수가 늘어날수록 골칫거리로 전락하기 쉽다.

조건부 로직을 명확한 구조로 보완하는 방법은 다양하지만, 여기서는 객체지향의 핵심 특성인 다형성을 활용하기로 했다.

이번 작업의 목표는 상속 계층을 구성해서 희극 서브클래스와 비극 서브클래스가 각자의 구체적인 계산 로직을 정의하는 것이다. 호출하는 쪽에서는 다형성 버전의 공연료 계산 함수를 호출하기만 하면 되고, 희극이냐 비극이냐에 따라 정확한 계산 로직을 ㅇ녀결하는 작업은 언어 차원에서 처리해준다.

적립 포인트 계산도 비슷한 구조로 만들 것이다. 이 과정에서 몇 가지 리팩터링 기법을 적용하는데 그중 핵심은 **조건부 로직을 다형성으로 바꾸기**다. 이 리팩터링은 조건부 코드 한 덩어리를 다형성을 활용하는 방식으로 바꿔준다. 그런데 이 리팩터링을 적용하려면 상속 계층부터 정의해야 한다. 즉, 공연료와 적립 포인트 계산 함수를 담을 클래스가 필요하다.

---

일단 공연료 계산기부터 만들자. `createStatementData()` 함수의 핵심은 `enrichPerformance()` 함수다. 이 함수는 조건부 로직을 포함한 함수인 `amountFor()`와 `volumeCreditsFor()`를 호출하여 공연료와 적립 포인트를 계산한다. 이번에 이 두 함수를 전용 클래스로 옮겨보자. 전용 클래스 이름은 `PerformanceCalculator`가 좋겠다.

그리고 기존 코드에서 몇 가지 동작을 공연료 계산기 클래스로 옮겨보자. 먼저 가장 간단한 연극 레코드(`play`)부터 옮기자. 사실 이 작업은 다형성을 적용해야 할 만큼 차이가 크지 않으니 반드시 할 필요는 없지만, 모든 데이터 변환을 한 곳에서 수행할 수 있어서 코드가 더욱 명확해진다.

---

이후 `amountFor()` 함수를 `PerformanceCalculator` 클래스 내부의 `get amount`로 옮기자.

```javascript
class PerformanceCalculator {
  constructor(aPerformance, aPlay) {
    this.performance = aPerformance;
    this.play = aPlay;
  }

  get amount() {
    let result = 0;
    switch (this.play.type) {
      case 'tragedy':
        result = 40000;
        if (this.performance.audience > 30) {
          result += 1000 * (this.performance.audience - 30);
        }
        break;
      case 'comedy':
        result = 30000;
        if (this.performance.audience > 20) {
          result += 10000 + 500 * (this.performance.audience - 20);
        }
        result += 300 * this.performance.audience;
        break;
      default:
        throw new Error(`알 수 없는 장르: ${this.play.type}`);
    }

    return result;
  }
}
```

적립 포인트를 계산하는 함수(`volumeCreditsFor()`)도 같은 방법으로 옮기자.

```javascript
// PerformanceCalculator 내부
get volumeCredits() {
  let result = 0;
  result += Math.max(this.performance.audience - 30, 0);
  if (this.play.type === 'comedy') {
    result += Math.floor(this.performance.audience / 5);
  }
  return result;
}
```

---

클래스에 로직들을 담았으니 이제 다형성을 지원하게 만들어보자. 가장 먼저 할 일은 **타입 코드를 서브클래스로 바꾸기**다. 이렇게 하려면 `PerformaceCalculator`의 서브클래스들을 준비하고 `createStatementData()`에서 그중 적합한 서브클래스를 사용하게 만들어야 한다. 그리고 딱 맞는 서브클래스를 사용하려면 생성자 대신 함수를 호출하도록 바꿔야 한다(자바스크립트에서는 생성자가 서브클래스의 인스턴스를 반환할 수 없기 때문). 그래서 **생성자를 팩터리 함수로 바꾸기**를 적용한다.

```javascript
function createPerformanceCalculator(aPerformance, aPlay) {
  return new PerformanceCalculator(aPerformance, aPlay);
}

export default function createStatementData(invoice, plays) {
  // ...

  function enrichPerformance(aPerformance) {
    const calculator = createPerformanceCalculator(aPerformance, playFor(aPerformance));
    const result = { ...aPerformance };
    result.play = calculator.play;
    result.amount = calculator.amount;
    result.volumeCredits = calculator.volumeCredits;
    return result;
  }

  // ...
}
```

`createPerformanceCalculator()` 함수를 이용하면 `PerformanceCalculator`의 서브클래스 중 어떤 클래스를 생성해서 반환할 지 선택할 수 있다.

```javascript
function createPerformanceCalculator(aPerformance, aPlay) {
  switch (aPlay.type) {
    case 'tragedy':
      return new TragedyCalculator(aPerformance, aPlay);
    case 'comedy':
      return new ComedyCalculator(aPerformance, aPlay);
    default:
      throw new Error(`알 수 없는 장르: ${aPlay.type}`);
  }
}

class TragedyCalculator extends PerformanceCalculator {
  get amount() {
    let result = 40000;
    if (this.performance.audience > 30) {
      result += 1000 * (this.performance.audience - 30);
    }
    return result;
  }
}

class ComedyCalculator extends PerformanceCalculator {
  get amount() {
    let result = 30000;
    if (this.performance.audience > 20) {
      result += 10000 + 500 * (this.performance.audience - 20);
    }
    result += 300 * this.performance.audience;
    return result;
  }
}
```

그리고 `PerformanceCalculator`의 서브클래스인 `TragedyCalculator`와 `ComedyCalculator`를 만들고, `amount`를 오버라이딩해주면 된다.

이제 슈퍼클래스의 `amount()` 메서드는 호출할 일이 없으니 삭제해도 좋으나 미래의 나에게 한 마디 남겨놓는 게 좋을 것 같다.

```javascript
class PerformanceCalculator {
  // ...

  get amount() {
    throw new Error('서브클래스에서 처리하도록 설계되었습니다.');
  }

  // ...
}
```

이제 `volumeCredits()`메서드도 다형성으로 처리하자. 여기서는 희극의 경우만 포인트 계산 방식이 달라지므로 기본 처리는 슈퍼클래스에서 하고, 희극만 오버라이딩해서 별도로 처리하는 것이 좋다.

```javascript
class PerformanceCalculator {
  // ...

  get volumeCredits() {
    return Math.max(this.performance.audience - 30, 0);
  }
}

class ComedyCalculator extends PerformanceCalculator {
  // ...

  get volumeCredits() {
    return super.volumeCredits + Math.floor(this.performance.audience / 5);
  }
}
```
