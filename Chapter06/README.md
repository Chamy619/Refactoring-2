# Chapter06 기본적인 리팩터링

- [함수 추출하기](#함수-추출하기)
- [함수 인라인하기](#함수-인라인하기)
- [변수 추출하기](#변수-추출하기)
- [변수 인라인하기](#변수-인라인하기)
- [함수 선언 바꾸기](#함수-선언-바꾸기)
- [변수 캡슐화하기](#변수-캡슐화하기)
- [변수 이름 바꾸기](#변수-이름-바꾸기)
- [매개변수 객체 만들기](#매개변수-객체-만들기)
- [여러 함수를 클래스로 묶기](#여러-함수를-클래스로-묶기)
- [어려 함수를 변환 함수로 묶기](#여러-함수를-변환-함수로-묶기)
- [단계 쪼개기](#단계-쪼개기)

## 함수 추출하기

**함수 추출하기**는 코드 조각을 찾아 무슨 일을 하는지 파악한 다음 독립된 함수로 추출하고 목적에 맞는 이름을 붙이는 리팩터링이다. 독립된 함수로 묶는 기준은 여러가지가 있을 수 있는데 '목적과 구현을 분리'하는 방식이 가장 합리적인 기준이 될 수 있다. 코드를 보고 무슨 일을 하는지 파악하는 데 한참이 걸린다면 그 부분을 함수로 추출한 뒤 '무슨 일'에 걸맞는 이름을 붙이자. 이렇게 해두면 나중에 코드를 다시 읽을 때 함수의 목적을 더 쉽게 알 수 있고, 본문 코드에 대해서 신경쓰지 않아도 된다.

### 절차

1. 함수를 새로 만들고 목적을 잘 드러내는 이름을 붙인다.('어떻게'가 아닌 '무엇을' 하는지가 드러나도록)

   - **대상 코드가 매우 간단하더라도 함수로 뽑아서 목적이 더 잘 드러나는 이름을 붙일 수 있다면 추출한다.** 이런 이름이 떠오르지 않는다면 함수로 추출하면 안 된다는 신호다. 추출 과정에서 좋은 이름이 떠오를 수도 있으니 처음부터 최선의 이름을 짓고 시작할 필요는 없다. 일단 함수로 추출해서 사용해보고 효과가 크지 않으면 다시 원래 상태로 인라인해도 된다. 그 과정에서 조금이라도 깨달은 게 있다면 시간 낭비는 아니다. 중첩 함수를 지원하는 언어를 사용한다면 추출한 함수를 원래 함수 안에 중첩시킨다. 그러면 다음 단계에서 수행할 유효범위를 벗어난 변수를 처리하는 작업을 줄일 수 있다. 원래 함수의 바깥으로 꺼내야 할 때가 오면 **함수 옮기기**를 적용하면 된다.

2. 추출할 코드를 원본 함수에서 복사하여 새 함수에 붙여넣는다.
3. 추출한 코드 중 원본 함수의 지역 변수를 참조하거나 추출한 함수의 유효범위를 벗어나는 변수는 없는지 검사한다. 있다면 매개변수로 전달한다.

   - 원본 함수의 중첩 함수로 추출할 때는 이런 문제가 생기지 않는다.
   - 일반적으로 함수에는 지역 변수와 매개변수가 있는데 가장 일반적인 처리 방법은 이런 변수를 모두 인수로 전달하는 것이다. 사용은 하지만 값이 바뀌지 않는 변수는 이렇게 처리할 수 있다.
   - 추출한 코드에서만 사용하는 변수가 추출한 함수 밖에 선언되어 있다면 추출한 함수 안에서 선언하도록 수정한다.
   - 추출한 코드 안에서 값이 바뀌는 변수 중에서 값으로 전달되는 것들은 주의해서 처리해야 한다. 이런 변수가 하나뿐이라면 추출한 코드를 질의 함수로 취급해서 리턴하자.
   - 추출한 코드에서 값을 수정하는 지역 변수가 많을 경우 함수 추출을 멈추고 **변수 쪼개기**나 **임시 변수를 질의 함수로 바꾸기**와 같은 다른 리팩터링을 적용해서 변수를 사용하는 코드를 단순하게 바꾸고 이후 함수 추출을 시도하자.

4. 변수를 다 처리했다면 컴파일한다.
5. 원본 함수에서 추출한 코드 부분을 새로 만든 함수를 호출하는 문장으로 바꾼다.
6. 테스트한다.
7. 다른 코드에 방금 추출한 것과 똑같거나 비슷한 코드가 없는지 살핀다. 있다면 방금 추출한 새 함수를 호출하도록 바꿀지 검토한다.

## 함수 인라인하기

```javascript
function getRating(driver) {
  return moreThanFiveLateDeliveries(driver) ? 2 : 1;
}

function moreThanFiveLateDeliveries(driver) {
  return driver.numberOfLateDeliveries > 5;
}
```

```javascript
function getRating(driver) {
  return driver.numberOfLateDeliveries > 5 ? 2 : 1;
}
```

위의 예처럼 때로는 함수 본문이 이름만큼 명확한 경우가 있다. 이 때는 함수를 제거하고 본문을 그대로 사용하자. 간접 호출은 유용할 수도 있지만 쓸데없는 간접 호출은 거슬릴 뿐이다.

리팩터링 과정에서 잘못 추출된 함수들도 다시 인라인하자. 잘못 추출된 함수들을 원래 함수로 합친 다음 필요하면 원하는 형태로 다시 추출하자.

간접 호출을 너무 과하게 쓰는 코드도 흔한 인라인 대상이다. 다른 함수로 단순히 위임하기만 하는 함수들이 너무 많아서 위임 관계가 복잡하게 얽혀 있으면 인라인해버린다. 함수 인라인하기를 활용하면 유용한 것만 남기고 나머지는 제거할 수 있다.

### 절차

1. 다형 메서드인지 확인한다.

   - 서브클래스에서 오버라이드하는 메서드는 인라인하면 안 된다.

2. 인라인할 함수를 호출하는 곳을 모두 찾는다.
3. 각 호출문을 함수 본문으로 교체한다.
4. 하나씩 교체할 때마다 테스트한다.

   - 인라인 작업을 한 번에 처리할 필요는 없다. 인라인하기가 까다로운 부분이 있다면 일단 남겨두고 여유가 생길 때마다 틈틈이 처리한다.

5. 함수의 정의(원래 함수)를 삭제한다.

## 변수 추출하기

표현식이 너무 복잡해서 이해하기 어려울 때가 있다. 이럴 때 지역 변수를 활용하면 표현식을 쪼개 관리하기 더 쉽게 만들 수 있다. 그러면 복잡한 로직을 구성하는 단계마다 이름을 붙일 수 있어서 코드의 목적을 훨씬 명확하게 드러낼 수 있다.

변수 추출은 표현식에 이름을 붙이고자 할 때 고려하자. 이름을 붙이기로 했다면 그 이름이 들어갈 문맥도 살펴야 한다. 현재 함수 안에서만 의미가 있다면 변수로 추출하는 것이 좋다. 그러나 함수를 벗어난 넓은 문맥에서까지 의미가 된다면 그 넓은 범위에서 통용되는 이름을 생각해야 한다. 다시 말해 변수가 아닌 함수로 추출해야 한다. 이름이 통용되는 문맥을 넓히면 다른 코드에서 사용할 수 있기 때문에 같은 표현식을 중복해서 작성하지 않아도 된다. 그래서 중복이 적으면서 의도가 잘 드러나는 코드를 작성할 수 있다.

### 절차

1. 추출하려는 표현식에 부작용은 없는지 확인한다.
2. 불변 변수를 하나 선언하고 일믕르 붙일 표현식의 복제본을 대입한다.
3. 원본 표현식을 새로 만든 변수로 교체한다.
4. 테스트한다.
5. 표현식을 여러 곳에서 사용한다면 각각을 새로 만든 변수로 교체한다. 하나 교체할 때마다 테스트한다.

## 변수 인라인하기

변수는 함수 안에서 표현식을 가리키는 이름으로 쓰이며, 대체로 긍정적인 효과를 준다. 하지만 그 이름이 원래 표현식과 다를 바 없을 때도 있다. 또 변수가 주변 코드를 리팩터링하는 데 방해가 되기도 한다. 이럴 때는 그 변수를 인라인하는 것이 좋다.

### 절차

1. 대입문의 우변에서 부작용이 생기지는 않는지 확인한다.
2. 변수가 불변으로 선언되지 않았다면 불변으로 만든 후 테스트한다.
3. 이 변수를 가장 처음 사용하는 코드를 찾아서 대입문 우변의 코드로 바꾼다.
4. 테스트한다.
5. 변수를 사용하는 부분을 모두 교체할 때까지 이 과정을 반복한다.
6. 변수 선언문과 대입문을 지운다.
7. 테스트한다.

## 함수 선언 바꾸기

함수 이름 바꾸기 또는 시그니처 바꾸기라는 표현으로 사용할 수도 있다. 함수는 프로그램을 나누는 주된 수단이다. 함수 선언은 각 부분이 서로 맞물리는 방식을 표현하며, 실질적으로 소프트웨어 시스템의 구성 요소를 조립하는 연결부 역할을 한다. 건축과 마찬가지로 소프트웨어도 이러한 연결부에 상당히 의존한다. 연결부를 잘 정의하면 시스템에 새로운 부분을 추가하기가 쉬워지는 반면, 잘못 정의하면 지속적인 방해 요인으로 작용하여 소프트웨어 동작을 파악하기 어려워지고 요구사항이 바뀔 때 적절히 수정하기 어렵게 한다.

연결부에서 가장 중요한 요소는 함수의 이름이다. 이름이 좋으면 함수의 구현 코드를 살펴볼 필요 없이 호출문만 보고도 무슨 일을 하는지 파악할 수 있다. 하지만 좋은 이름을 떠올리기란 쉽지 않다. 이름이 잘못된 함수를 발견하면 더 나은 이름이 떠오르는 즉시 바꾸자. 그래야 나중에 또 고민하지 않게 된다.

> 좋은 이름을 떠올리는 데 효과적인 방법은 주석을 이용해 함수의 목적을 설명해보는 것이다. 그러다 보면 주석이 멋진 이름으로 바뀌어 되돌아올 때가 있다.

### 절차

#### 간단한 절차

1. 매개변수를 제거하려거든 먼저 함수 본문에서 제거 대상 매개변수를 참조하는 곳은 없는지 확인한다.
2. 메서드 선언을 원하는 형태로 바꾼다.
3. 기존 메서드 선언을 참조하는 부분을 모두 찾아서 바뀐 형태로 수정한다.
4. 테스트한다.

#### 마이그레이션 절차

1. 이어지는 추출 단계를 수월하게 만들어야 한다면 함수의 본문을 적절히 리팩터링한다.
2. 함수 본문을 새로운 함수로 추출한다.
3. 추출한 함수에 매개변수를 추가해야 한다면 '간단한 절차'를 따라 추가한다.
4. 테스트한다.
5. 기존 함수를 인라인한다.
6. 이름을 임시로 붙여뒀다면 함수 선언 바꾸기를 한 번 더 적용해서 원래 이름으로 되돌린다.
7. 테스트한다.

## 변수 캡슐화하기

함수는 데이터보다 다루기가 수월하다. 함수를 사용한다는 건 대체로 호출한다는 뜻이고, 함수의 이름을 바꾸거나 다른 모듈로 옮기기는 어렵지 않다. 여차하면 기존 함수를 그대로 둔 채 전달 함수로 활용할 수도 있기 때문이다.

반대로 데이터는 함수보다 다루기가 까다롭다. 데이터는 참조하는 모든 부분을 한 번에 바꿔야 코드가 제대로 작동한다. 짧은 함수 안의 임시 변수처럼 유효범위가 아주 좁은 데이터는 어려울 게 없지만, 유효범위가 넓어질수록 다루기 어려워진다.

그래서 접근할 수 있는 범위가 넓은 데이터를 옮길 때는 먼저 그 데이터로의 접근을 독점하는 함수를 만드는 식으로 캡슐화하는 것이 가장 좋은 방법일 때가 많다. 데이터 재구성이라는 어려운 작업을 함수 재구성이라는 더 단순한 작업으로 변환하는 것이다.

데이터 캡슐화는 데이터를 변경하고 사용하는 코드를 감시할 수 있는 확실한 통로가 되어주기 때문에 데이터 변경 전 검증이나 변경 후 추가 로직을 쉽게 끼워 넣을 수 있다. 유효범위가 함수 하나보다 넓은 가변 데이터는 모두 이런 식으로 처리해보도록 하자. 데이터의 유효범위가 넓을수록 캡슐화해야 한다. 레거시 코드를 다룰 때는 이런 변수를 참조하는 코드를 추가하거나 변경할 때마다 최대한 캡슐화한다. 그래야 자주 사용하는 데이터에 대한 결합도가 높아지는 일을 막을 수 있다.

불변 데이터는 가변 데이터보다 캡슐화할 이유가 적다. 데이터가 변경될 일이 없어서 갱신 전 검증 같은 추가 로직이 자리할 공간을 마련할 필요가 없기 때문이다. 게다가 불변 데이터는 옮길 필요 없이 그냥 복제함녀 된다. 그래서 원본 데이터를 참좋는 코드를 변경할 필요도 없고, 데이터를 변형시키는 코드를 걱정할 일도 없다. 불변성은 강력한 방부제가 되어준다.

### 절차

1. 변수로의 접근과 갱신을 전담하는 캡슐화 함수들을 만든다.
2. 정적 검사를 수행한다.
3. 변수를 직접 참조하던 부분을 모두 적절한 캡슐화 함수 호출로 바꾼다. 하나씩 바꿀 때마다 테스트한다.
4. 변수의 접근 범위를 제한한다.

   - 변수로의 직접 접근을 막을 수 없을 때도 있다. 그럴 때는 변수 이름을 바꿔서 ㅌ테스트해보면 해당 변수를 참조하는 곳을 쉽게 찾아낼 수 있다.

5. 테스트한다.
6. 변수 값이 레코드라면 레코드 캡슐화하기를 적용할지 고려해본다.

```javascript
let person = { name: 'chamy', nationality: 'Korea' };
```

```javascript
function getDefaultPerson() {
  return person;
}
function setDefaultPerson(arg) {
  person = arg;
}
```

```javascript
let person = { name: 'chamy', nationality: 'Korea' };
export function getDefaultPerson() {
  return person;
}
export function setDefaultPerson(arg) {
  person = arg;
}
```

## 변수 이름 바꾸기

명확한 프로그래밍의 핵심은 이름짓기다. 변수는 프로그래머가 하려는 일에 관해 많은 것을 설명해준다. 단, 이름을 잘 지었을 때만 그렇다. 처음부터 완벽한 이름을 짓지 못하는 경우가 많다. 고민을 충분히 하지 않아서, 개발을 더 하다 보니 문제에 대한 이해도가 높아져서, 사용자의 요구가 달라져서 프로그램의 목적이 변해 그럴 때도 있다.

특히 이름의 중요성은 사용 범위에 영향을 많이 받는다. 한 줄짜리 람다식에서 사용하는 변수는 대체로 쉽게 파악할 수 있다. 맥락으로부터 변수의 목적을 명확히 알 수 있어서 한 글자로 된 이름을 짓기도 한다. 마찬가지로 간단한 함수의 매개변수 이름도 짧게 지어도 될 때가 많다.

함수 호출 한 번으로 끝나지 않고 값이 영속되는 필드라면 이름에 더 신경 써야 한다.

### 절차

1. 폭넓게 쓰이는 변수라면 변수 캡슐화하기를 고려한다.
2. 이름을 바꿀 변수를 참조하는 곳을 모두 찾아서 하나씩 변경한다.
   - 다른 코드베이스에서 참조하는 변수는 외부에 공개된 변수이므로 이 리팩터링을 적용할 수 없다.
   - 변수 값이 변하지 않는다면 다른 이름으로 복제본을 만들어서 하나씩 점진적으로 변경한다.
3. 테스트한다.

## 매개변수 객체 만들기

```javascript
function amountInvoiced(startDate, endDate) {...}
function amountReceived(startDate, endDate) {...}
function amountOverdue(startDate, endDate) {...}
```

```javascript
function amountInvoiced(aDateRange) {...}
function amountReceived(aDateRange) {...}
function amountOverdue(aDateRange) {...}
```

데이터 항목 여러 개가 이 함수에서 저 함수로 함께 몰려다니는 경우를 자주 본다. 이런 데이터 무리를 발견하면 데이터 구조 하나로 모아주자.

데이터 뭉치를 데이터 구조로 묶으면 데이터 사이의 관계가 명확해진다는 이점을 얻는다. 게다가 함수가 이 데이터 구조를 받게 하면 매개변수 수가 줄어든다. 같은 데이터 구조를 사용하는 모든 함수가 원소를 참조할 때 항상 똑같은 이름을 사용하기 때문에 일관성도 높여준다.

**하지만 이 리팩터링의 진정한 힘은 코드를 더 근본적으로 바꿔준다는데 있다.** 이런 데이터 구조를 새로 발견하면 데이터 구조를 활용하는 형태로 그로그램 동작을 재구성해보자. 데이터 구조에 담길 데이터에 공통으로 적용되는 동작을 추출해서 함수로 만드는 것이다(공용 함수를 나열하는 식으로 작성할 수도 있고, 이 함수들과 데이터를 합쳐 클래스로 만들 수도 있다). 이 과정에서 새로 만든 데이터 구조가 문제 영역을 훨씬 간결하게 표현하는 새로운 추상 개념으로 격상되면서, 코드의 개념적인 그림을 다시 그릴 수도 있다. 그러면 놀라울 정도로 강력한 효과를 낸다. 하지만 이 모든 것의 시작은 매개변수 객체 만들기부터다.

### 절차

1. 적당한 데이터 구조가 아직 마련되어 있지 않다면 새로 만든다.
   - 클래스로 만드는 걸 추천한다. 나중에 동작까지 함께 묶기 좋기 때문이다.
2. 테스트한다.
3. 함수 선언 바꾸기로 새 데이터 구조를 매개변수로 추가한다.
4. 테스트한다.
5. 함수 호출 시 새로운 데이터 구조 인스턴스를 넘기도록 수정한다. 하나씩 수정할 때마다 테스트한다.
6. 기존 매개변수를 사용하던 코드를 새 데이터 구조의 원소를 사용하도록 바꾼다.
7. 기존 매개변수를 제거하고 테스트한다.

## 여러 함수를 클래스로 묶기

```javascript
function base(aReading) {...}
function taxableCharge(aReading) {...}
function calculateBaseCharge(aReading) {...}
```

```javascript
class Reading {
  base() {...}
  taxableCharge() {...}
  calculateBaseCharge() {...}
}
```

클래스는 대다수의 최신 프로그래밍 언어가 제공하는 기본적인 빌딩 블록이다. 클래스는 데이터와 함수를 하나의 공유 환경으로 묶은 후, 다른 프로그램 요소와 어우러질 수 있도록 그중 일부를 외부에 제공한다.

함수 호출 시 인수로 전달되는 공통 데이터를 중심으로 긴밀하게 엮여 작동하는 함수 무리를 발견하면 하나의 클래스로 묶을 수 없을지 고려해보자. 클래스로 묶으면 이 함수들이 공유하는 공통 환경을 더 명확하게 표현할 수 있고, 각 함수에 전달되는 인수를 줄여서 객체 안에서의 함수 호출을 간결하게 만들 수 있다. 또한 이런 객체를 시스템의 다른 부분에 전달하기 위한 참조를 제공할 수 있다.

이 리팩터링은 이미 만들어진 함수를 재구성할 때는 물론, 새로 만든 클래스와 관련하여 놓친 연산을 찾아서 새 클래스의 메서드로 뽑아내는 데도 좋다.

함수를 한데 묶는 또 다른 방법으로는 **여러 함수를 변환 함수로 묶기**도 있다. 어느 방식으로 진행할지는 프로그램 문맥을 넓게 살펴보고 정해야 한다. 클래스로 묶을 때의 두드러진 장점은 클라이언트가 객체의 핵심 데이터를 변경할 수 있고, 파생 객체들을 일관되게 관리할 수 있다는 것이다.

### 절차

1. 함수들이 공유하는 공통 데이터 레코드를 캡슐화한다.

   - 공통 데이터가 레코드 구조로 묶여 있지 않다면 먼저 **매개변수 객체 만들기**로 데이터를 하나로 묵는 레코드를 만든다.

2. 공통 레코드를 사용하는 함수 각각을 새 클래스로 옮긴다.

   - 공통 레코드의 멤버는 함수 호출문의 인수 목록에서 제거한다.

3. 데이터를 조작하는 로직들은 함수로 추출해서 새 클래스로 옮긴다.

## 여러 함수를 변환 함수로 묶기

소프트웨어는 데이터를 입력받아서 여러 가지 정보를 도출하곤 한다. 이렇게 도출된 정보는 여러 곳에서 사용될 수 있는데, 그러다 보면 이 정보가 사용되는 곳마다 같은 도출 로직이 반복되기도 한다. 이런 도출 로직을 한 곳에 모아두면 검색과 갱신을 일관된 장소에서 처리할 수 있고 중복 로직도 막을 수 있다.

이렇게 하기 위한 방법으로 변환 함수를 사용할 수 있다. 변환 함수는 원본 데이터를 입력받아서 필요한 정보를 모두 도출한 뒤, 각각을 출력 데이터의 필드에 넣어 반환한다. 이렇게 해두면 도출 과정을 검토할 일이 생겼을 때 변환 함수만 살펴보면 된다.

### 절차

1. 변환할 레코드를 입력받아서 값을 그대로 반환하는 함수를 만든다.

   - 이 작업은 대체로 깊은 복사로 처리해야 한다. 변환 함수가 원본 레코드를 바꾸지 않는지 검사하는 테스트를 마련해두면 도움될 때가 많다.

2. 묶을 함수 중 함수 하나를 골라서 본문 코드를 변환 함수로 옮기고 처리 결과를 레코드에 새 필드로 기록한다. 그런 다음 클라이언트 코드가 이 필드를 사용하도록 수정한다.

   - 로직이 복잡하면 함수 추출하기부터 한다.

3. 테스트한다.

4. 나머지 관련 함수도 위 과정에 따라 처리한다.

## 단계 쪼개기

```javascript
const orderData = orderString.split(/\s+/);
const productPrice = priceList[orderData[0].split('-')[1]];
const orderPrice = parseInt(orderData[1]) * productPrice;
```

```javascript
const orderRecord = parseOrder(order);
const orderPrice = price(orderRecord, priceList);

function parseOrder(aString) {
  const values = aString.split(/\s+/);
  return {
    productID: values[0].split('-')[1],
    quantity: parseInt(values[1]),
  };
}

function price(order, priceList) {
  return order.quantity * priceList[order.productID];
}
```

서로 다른 두 대상을 한꺼번에 다루는 코드를 발견하면 각각을 별개 모듈로 나누는 방법을 모색하자. 코드를 수정해야 할 때 두 대상을 동시에 생각할 필요 없이 하나에만 집중하기 위해서다. 모듈이 잘 분리되어 있다면 다른 모듈의 상세 내용은 전혀 기억하지 못해도 원하는 대로 수정을 끝마칠 수도 있다.

이렇게 분리하는 가장 간편한 방법 하나는 동작을 연이은 두 단계로 쪼개는 것이다. 예를 들어, 입력이 처리 로직에 적합하지 않은 형태로 들어오는 경우 본 작업에 들어가기 전에 입력값을 다루기 편한 형태로 가공한다. 아니면 로직을 순차적인 단계들로 분리해도 된다. 이때 각 단계는 서로 확연히 다른 일을 수행해야 한다.

단계를 쪼개는 기법은 주로 덩치 큰 소프트웨어에 적용된다. 하지만 규모에 상관없이 여러 단계로 분리하면 좋을만한 코드를 발견하면 이 리팩터링을 진행하자. 다른 단계로 볼 수 있는 코드 영역들이 마침 서로 다른 데이터와 함수를 사용한다면 단계 쪼개기에 적합하다는 뜻이다. 이 코드 영역들을 별도 모듈로 분리하면 그 차이를 코드에서 훨씬 분명하게 드러낼 수 있다.

### 절차

1. 두 번째 단계에 해당하는 코드를 독립 함수로 추출한다.
2. 테스트한다.
3. 중간 데이터 구조를 만들어서 앞에서 추출한 함수의 인수로 추가한다.
4. 테스트한다.
5. 추출한 두 번째 단계 함수의 매개변수를 하나씩 검토한다.그중 첫 번째 단계에서 사용되는 것은 중간 데이터 구조로 옮긴다. 하나씩 옮길 때마다 테스트한다.

   - 간혹 두 번째 단계에서 사용하면 안되는 매개변수가 있다. 이럴 때는 각 매개변수를 사용한 결과를 중간 데이터 구조의 필드로 추출하고, 이 필드의 값을 설정하는 문장을 호출한 곳으로 옮긴다.

6. 첫 번째 단계 코드를 함수로 추출하면서 중간 데이터 구조를 반환하도록 만든다.

   - 이때 첫 번째 단계를 변환기 객체로 추출해도 좋다.

```javascript
function priceOrder(product, quantity, shippingMethod) {
  const basePrice = product.basePrice * quantity;
  const discount = Math.max(quantity - product.discountThreshold, 0) * product.basePrice * product.discountRate;
  const shippingPerCase =
    basePrice > shippingMethod.discountThreshold ? shippingMethod.discountedFee : shippingMethod.feePerCase;
  const shippingCost = quantity * shippingPerCase;
  const price = basePrice - discount + shippingCost;
  return price;
}
```

위의 함수는 상품의 가격을 계산하는 부분과 배송비를 계산하는 두 단계로 이루어져 있다. 나중에 상품 가격과 배송비 계산을 더 복잡하게 만드는 변경이 생긴다면 이 코드는 두 단계로 나누는 것이 좋다. 먼저 두 번째 단계인 배송비 부분을 함수로 추출하자.

```javascript
function priceOrder(product, quantity, shippingMethod) {
  const basePrice = product.basePrice * quantity;
  const discount = Math.max(quantity - product.discountThreshold, 0) * product.basePrice * product.discountRate;
  const price = applyShipping(basePrice, shippingMethod, quantity, discount);
  return price;
}

function applyShipping(basePrice, shippingMethod, quantity, discount) {
  const shippingPerCase =
    basePrice > shippingMethod.discountThreshold ? shippingMethod.discountedFee : shippingMethod.feePerCase;
  const shippingCost = quantity * shippingPerCase;
  const price = basePrice - discount + shippingCost;
  return price;
}
```

두 번째 단계에 필요한 데이터를 모두 개별 매개변수로 전달했다. 실제로 매개변수가 굉장히 많을 수 있는데, 나중에 걸러낼 것이기 때문에 걱정할 필요가 없다.

다음으로 첫 번째 단계와 두 번째 단계가 주고받을 중간 데이터 구조를 만들자.

```javascript
function priceOrder(product, quantity, shippingMethod) {
  const basePrice = product.basePrice * quantity;
  const discount = Math.max(quantity - product.discountThreshold, 0) * product.basePrice * product.discountRate;
  const priceData = { basePrice, quantity, discount };
  const price = applyShipping(priceData, shippingMethod);
  return price;
}

function applyShipping(priceData, shippingMethod) {
  const shippingPerCase =
    priceData.basePrice > shippingMethod.discountThreshold ? shippingMethod.discountedFee : shippingMethod.feePerCase;
  const shippingCost = priceData.quantity * shippingPerCase;
  const price = basePrice - priceData.discount + shippingCost;
  return price;
}
```

중간 데이터 구조를 만들 때는 첫 번째 단계에서 사용하는 데이터만 중간 데이터 구조에 추가하고, 첫 번째 단계에서 사용하지 않는 값은 매개변수로 그냥 두자.

이제 첫 번째 단계 코드를 함수로 추출하고 이 데이터 구조를 반환하게 하자.

```javascript
function priceOrder(product, quantity, shippingMethod) {
  const priceData = calculatePricingData(product, quantity);
  const price = applyShipping(priceData, shippingMethod);
  return price;
}

function calculatePricingData(product, quantity) {
  const basePrice = product.basePrice * quantity;
  const discount = Math.max(quantity - product.discountThreshold, 0) * product.basePrice * product.discountRate;
  return { basePrice, quantity, discount };
}

function applyShipping(priceData, shippingMethod) {
  const shippingPerCase =
    priceData.basePrice > shippingMethod.discountThreshold ? shippingMethod.discountedFee : shippingMethod.feePerCase;
  const shippingCost = priceData.quantity * shippingPerCase;
  const price = basePrice - priceData.discount + shippingCost;
  return price;
}
```

이제 마지막으로 코드를 정리하면 된다.

```javascript
function priceOrder(product, quantity, shippingMethod) {
  const priceData = calculatePricingData(product, quantity);
  return applyShipping(priceData, shippingMethod);
}

function calculatePricingData(product, quantity) {
  const basePrice = product.basePrice * quantity;
  const discount = Math.max(quantity - product.discountThreshold, 0) * product.basePrice * product.discountRate;
  return { basePrice, quantity, discount };
}

function applyShipping(priceData, shippingMethod) {
  const shippingPerCase =
    priceData.basePrice > shippingMethod.discountThreshold ? shippingMethod.discountedFee : shippingMethod.feePerCase;
  const shippingCost = priceData.quantity * shippingPerCase;
  return basePrice - priceData.discount + shippingCost;
}
```
