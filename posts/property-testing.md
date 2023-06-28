---
title: Property testing
tags: [Testing]
created: 2018-10-15
summary: An introduction to property-based testing and its applications in standard library algorithm validation
---

Property testing is a strategy for verifying the correctness of complex programs and libraries. It involves defining a set of properties that programs should obey. Essentially, the programmer writes a specification for their work.

You define properties with a property testing library, like Haskell's QuickCheck.[^1] These libraries also enable users to generate sample data to drive properties during test execution.

For example, this [ScalaCheck](https://www.scalacheck.org/) property says a JSON parser can decode any object it encodes:[^2]

```scala
object JsonSpecification extends Properties("encode & decode") {
  property("roundtrip") = Prop.forAll(json) { json =>
    Json.decode(Json.encode(json)) == Right(json)
  }
}
```

We will write property tests for a sorting algorithm to illustrate the value of property testing.

Fluency with Scala -- or a similar functional programming language -- is required to follow the rest of this post.[^3]

## Properties VS Assertions

In a typical unit test, we assert that the function under test behaves as expected for a single input value. A property test verifies that a function behaves correctly for _a family_ of input values.

If a test function has a finite domain, ScalaCheck can generate input exhaustively. Otherwise, we have to resort to sampling.[^4] Regardless, a single property test for a function usually gives us more confidence that our code works than multiple unit tests.

However, table-driven tests are better at documenting edge case behavior. They also ensure tests always run for edge case input. For JSON parsing, edge case input includes empty JSON strings, arrays, and objects.

## A specification for sorting

A sorting algorithm satisfies two properties:

1. It permutes its input to form its output, and
2. it reorders its input according to a [total order](https://en.wikipedia.org/wiki/Total_order).

Stable sorting algorithms satisfy a third property: they preserve the relative order of elements with identical sort keys.[^5]

Sorting algorithms act on linear data structures like arrays and lists. Most sorting algorithms admit [side effects](<https://en.wikipedia.org/wiki/Side_effect_(computer_science)>), which makes them awkward to use in functional programming.

Fortunately, the top-down variant of mergesort can sort a [list](https://en.wikipedia.org/wiki/Cons) without performing side effects. We will look at this sorting algorithm as it leads to elegant property definitions.

## Mergesort

Top-down mergesort is a divide-and-conquer algorithm. It splits a list in two, recursively sorts the partitions, and then merges them.

Suppose we have two functions,

1. `split`, which divides a list into two lists, and
2. `merge`, which combines two sorted lists into a longer sorted list;

then we can write mergesort as a [pure function](https://en.wikipedia.org/wiki/Pure_function):

```scala
def sort[T](list: List[T])(implicit ordering: Ordering[T]): List[T] =
  list match {
    case Nil         => Nil
    case head :: Nil => list
    case _ =>
      split(list) match {
        case (left, right) => merge(sort(left), sort(right))
      }
  }
```

This version of mergesort performs an asymptotically optimal number of comparisons, despite being pure.[^6]

`split` is a general-purpose function.[^7] Like `sort`, `split` is recursive:

```scala
def split[T](list: List[T]): (List[T], List[T]) =
  list match {
    case Nil => (Nil, Nil)
    case head :: tail =>
      split(tail) match {
        case (left, right) => (right, head :: left)
      }
  }
```

By switching the position of `left` and `right`, `split` ensures that its return values differ in length at most by one.[^8]

`merge` is easier to implement than `split`:

```scala
import math.Ordering.Implicits.infixOrderingOps

def merge(l: List[T], r: List[T]): List[T] =
  (l, r) match {
    case (Nil, _) => r
    case (_, Nil) => l
    case (lh :: lt, rh :: _) if lh <= rh =>
      lh :: merge(lt, r)
    case (_, rh :: rt) =>
      rh :: merge(l, rt)
  }
```

## Testing, Testing

To use ScalaCheck, we need to be aware of two data types it exports: `Gen`, and `Prop`.

A `Gen[T]` instance encodes all the information necessary to produce samples of type `T`. `Prop` allows us to define properties. A `Prop` instance verifies a property by sampling a `Gen[T]` instance.

### Writing generators

`sort` is a generic function — it would be pretty useless otherwise. We can’t write generators for the infinite number of input types that generic functions accept. We have to limit ourselves to a handful of types. For the sake of simplicity, let's feed `sort` with positive integer lists.

We can use the combinators ScalaCheck provides to write a generator for lists:

```scala
val ints: Gen[List[Int]] =
  Gen.listOf(Gen.posNum[Int])
```

ScalaCheck will choose the number of lists to generate when running a test. It will also pick the size of the largest list. ScalaCheck may not behave as we want it to by default.[^9]

### Writing properties

The first property practically writes itself if we already have a counter abstraction:

```scala
object SortingSpecification extends Properties("sort") {
  property("permutes its input") =
    Props.forAll(ints) { list =>
      Counter(sort(list)) == Counter(list)
    }
}
```

Scala has no counter type in its standard library, so we must write our own. Thankfully, it is straightforward to implement `Counter`:

```scala
case class Counter[K] private (keys: Map[K, Int]) {
  def apply(key: K): Int = keys.getOrElse(key, 0)

  def +(key: K): Counter[K] = {
    val count = this(key) + 1
    Counter(keys + (key -> count))
  }

  def -(key: K): Counter[K] = {
    val count = Math.max(this(key) - 1, 0)
    Counter(keys + (key -> count))
  }
}

object Counter {
  def empty[K]: Counter[K] = new Counter(Map.empty)

  def apply[K](keys: Seq[K]): Counter[K] =
    keys.foldLeft(Counter.empty[K])(_ + _)
}
```

The second property is also simple to write:

```scala
import math.Ordering.Implicits.infixOrderingOps

def isSorted[T](list: List[T])(implicit ordering: Ordering[T]): Boolean =
  list.zip(list.tail).forall { case (left, right) => left <= right }

object SortingSpecification extends Properties("sort") {
  property("returns a sorted list") =
    Prop.forAll(ints)(isSorted compose sort)
}
```

If `sort` is faulty ScalaCheck will

1. "shrink" input to find the smallest list it cannot sort, and
2. print out the seed of the failing test run to aid debugging.

```
failing seed for sort is 1GSNrW_g7K6qDK0yf7ZVqjncxQGRBA2_afg_I2PsRKC=
! sort.`permutes its input`: Falsified after 10 passed tests.
> ARG_0: List("1", "1", "0")
> ARG_0_ORIGINAL: LIst("10", "95", "78", "13", "64")
```

If you want more insight into how ScalaCheck works, look at the book [Functional Programming in Scala](https://www.manning.com/books/functional-programming-in-scala). In chapter eight, readers develop a property testing library from first principles.

[^1]: QuickCheck [pioneered](https://doi.org/10.1145/351240.351266) property testing.
[^2]: You may wish to write regression tests to also verify `decode(str).map(encode) == Right(str)`.
[^3]: You have been warned!
[^4]:
    Astute readers will realize `JsonSpecification` relies on sampling. We must use lazy generation to sample instances of tree [ADT](https://en.wikipedia.org/wiki/Abstract_data_type)s like `Json`.

    Here is one way of implementing `json`:

    ```scala
    val arr: Gen[Json] = Gen.listOfN(4, json).map(Json.arr)

    val kv: Gen[(String, Json)] =
      for {
        key <- Gen.asciiStr
        value <- json
      } yield (key, value)

    val obj: Gen[Json] = Gen.listOfN(4, kv).map(Json.obj)

    val json: Gen[Json] =
      Gen.delay(
        Gen.frequency(
          2 -> bool, 2 -> num, 2 -> str,
          3 -> arr, 3 -> obj
        )
      )
    ```

    Notice two safeguards limit the size of JSON arrays and objects:

    1. `Gen.listOfN` ensures collections have at most four keys
    2. `Gen.frequency` ensures `json` generates a collection on every other call

    Let $$D$$ be a random variable that denotes the depth of nested collections. It can be shown that $$D \sim \text{Geo}\left(\dfrac{1}{2}\right)$$. Thus, on average, `json` will generate collections with two levels of nesting.

[^5]: Many applications require stable sorting. Users of a food delivery app usually sort restaurants by customer rating, and then by delivery distance. They expect the app to rank equally distant restaurants in order of customer rating.
[^6]: It can be shown that top-down mergesort performs $$\Theta(n\lg n)$$ comparisons.
[^7]:
    This elegant implementation of `split` [is due to Evan Czaplicki's professor](https://functional-programming-in-elm.netlify.app/appendix/split.html).

    Unfortunately, `split` leads to an unstable sort :cry:. Why is that? Can you write a crude version of `split` that leads to a stable sort?

[^8]: You can prove this result by [mathematical induction](https://en.wikipedia.org/wiki/Mathematical_induction). Start by assuming it holds for all lists of length $$2n$$, where $$n \in \Z_0$$.
[^9]: Obtaining representative samples is tricky. Larger lists can encode exponentially more states than smaller ones. Should a sorting algorithm be tested more frequently with large lists? :thinking:
