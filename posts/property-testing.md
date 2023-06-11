---
title: Property testing
tags: [Testing]
created: 2018-10-15
summary: An introduction to property-based testing and its applications in standard library algorithm validation
---

Property testing is an effective strategy for verifying the correctness of complex programs and libraries. It involves defining a set of properties that functions or programs should obey. Essentially, the developer writes a specification for their work.

Properties are usually defined with the aid of a property testing library, like Haskell's QuickCheck.[^1] These libraries also enable users to generate sample data to drive properties during test execution.

For example, a specification that verifies a JSON parsing library can parse whatever objects it stringifies would look like

```scala
object JsonSpecification extends Properties("encode & decode") {
  property("roundtrip") = Prop.forAll(json) { js =>
    Json.decode(Json.encode(js)) == js
  }
}
```

in Scala, with [ScalaCheck](https://www.scalacheck.org/).

Mathematically speaking, it says that the `decode` function is an inverse of the `encode` function.[^2] In fact, specifying properties corresponds to how proofs of correctness are constructed in maths.[^3]

We will write a property test suite for an implementation of the mergesort algorithm to illustrate the value of property testing. The test suite will need to be comprehensive, as millions of people will be using our library.[^4]

Knowledge of Scala is not required to follow this post, but it could help you focus on the ideas being presented instead of language syntax.

You can find the completed test suite as a GitHub [gist](https://gist.github.com/bfdes/88f3292aa2d23e619714bee4221799d8). It prints

```plaintext
+ mergeSort.isSorted: OK, passed 100 tests.
+ mergeSort.hasSameKeys: OK, passed 100 tests.
```

when it runs.

## Properties VS Assertions

In an example-based test, we assert that the program under test behaves as we expect for a single input value. A property-based test verifies that a program behaves correctly for a family of input values.

A single property test for a program usually gives us more confidence that our code works than multiple ordinary test cases. For example, compare the table-driven test suite

```scala
object EncodeDecodeTestSuite extends TestSuite {
  private val testInputs =
    List(
      Json.num(13),
      Json.str("foo"),
      Json.arr("foo", "bar"),
      Json.obj("foo" -> "bar")
    )

  testInputs.foreach { js =>
    test(s"encode & decode roundtrips $js") {
      assert(Json.decode(Json.encode(js)) == js)
    }
  }
}
```

to the simple specification we saw before, which checks that many more input values roundtrip.[^5]

ScalaCheck can exhaustively generate test cases for functions that have a finite domain. For functions with an infinitely sized domain, such as the sorting function we will look at, we have to write generators that _sample_ the function domain.[^6]

Example-based tests are better at documenting edge case behaviour, or ensuring that tests always run for edge case input. For JSON parsing, edge case input could include empty strings, arrays or objects:

```scala
assert(Json.encode(Json.decode("")) == Json.str(""))
assert(Json.encode(Json.decode(Json.arr())) == Json.arr())
assert(Json.encode(Json.decode(Json.obj())) == Json.obj())
```

## A Specification for sorting

Formally, a sorting function is defined by two properties:

1. It must permute its **input** to form its **output**

$$
\left(a_i \mid i \in I \right) = \left(a'_i \mid i \in I \right)
$$

2. It must order its input to form its output according to a [total order](https://en.wikipedia.org/wiki/Total_order)

$$
a'_i \leq a'_j \space \forall \space i, j \in \{i, j \in I \mid i < j\}
$$

We have described arrays as a [family](https://math.stackexchange.com/questions/361449/notation-for-an-array/361530#361530), and the primed elements belong to the permuted array.

To help write the tests, we need a utility to check the keys of an array are in sorted order:

```scala
def isSorted[T](a: Array[T])(implicit o: Ordering[T]): Boolean =
  Range(0, a.length - 1).forall(i => a(i) <= a(i + 1))
```

, and a `Histogram` abstraction to count keys:

```scala
case class Histogram[K] private (value: Map[K, Int]) {
  def +(key: K): Histogram[K] = {
    val count = value.getOrElse(key, 0) + 1
    Histogram(value + (key -> count))
  }
}

object Histogram {
  def empty[K]: Histogram[K] = new Histogram(Map.empty)

  def apply[K](keys: Seq[K]): Histogram[K] =
    keys.foldLeft(Histogram.empty[K])(_ + _)
}
```

## Mergesort

The [gist](https://gist.github.com/bfdes/88f3292aa2d23e619714bee4221799d8) contains an implementation of mergesort transcribed to Scala from [Algorithms I](https://www.coursera.org/learn/algorithms-part1).[^7]

Mergesort is a divide-and-conquer algorithm; it consists of two subroutines:

1. One splits an array in two and recursively sorts the partitions, and
2. the other merges sorted partitions.

Note that our implementation `mergeSort` carries out a stable sort -- it ensures that any two keys which compare equally maintain their relative positions in an array. Writing a property to verify `mergeSort` is indeed stable is left as an exercise for the reader.[^8]

## Testing with ScalaCheck

To use ScalaCheck, we need to be aware of two data types it exports:

- `Gen[T]` instances encode all the information necessary to produce samples of type `T`
- `Prop` instances enable us to verify properties by sampling generators

### Writing generators

It is impossible to create generators for the infinite number of input types that generic functions like `mergeSort[T]` accept, so we have to limit ourselves to a handful. For the sake of simplicity, let's only feed the sorting function with positive integer array input.

We can use the combinators ScalaCheck provides to quickly write a generator for integer arrays:

```scala
val ints: Gen[Array[Int]] =
  Gen.containerOf[Array, Int](Gen.posNum[Int])
```

ScalaCheck will choose the number of samples to generate when running a test, as well as the size of the largest array. It may not behave as we want it to by default.[^6]

### Writing properties

It is straightforward to write property number one, given the array generator we already have:

```scala
Prop.forAll(ints) { a =>
  mergeSort(a)
  isSorted(a)
}
```

Writing property number two is only slightly more involved:

```scala
Prop.forAll(ints) { a =>
  val before = Histogram(a.toList)
  mergeSort(a)
  val after = Histogram(a.toList)
  before == after
}
```

### Putting it all together

We have everything we need to test `mergeSort` works (for integer arrays):

```scala
object SortingSpecification extends Properties("mergeSort") {
  val array: Gen[Array[Int]] =
    Gen.containerOf[Array, Int](Gen.posNum[Int])

  property("isSorted") = Prop.forAll(array) { a =>
    mergeSort(a)
    isSorted(a)
  }

  property("hasSameKeys") = Prop.forAll(array) { a =>
    val before = Histogram(a.toList)
    mergeSort(a)
    val after = Histogram(a.toList)
    before == after
  }
}
```

That's it! Not a lot of code, considering the problem we were trying to solve.

If `mergeSort` is faulty for whatever reason, then ScalaCheck will

1. "shrink" the input to find the smallest possible array that fails to be sorted, and
2. print out the seed for the failing test to aid debugging.

```plaintext
failing seed for mergeSort.isSorted is 1GSNrW_g7K6qDK0yf7ZVqjncxQGRBA2_afg_I2PsRKC=
! mergeSort.isSorted: Falsified after 10 passed tests.
> ARG_0: Array("1", "1", "0")
> ARG_0_ORIGINAL: Array("10", "95", "78", "13", "64")
```

If you want more insight into how ScalaCheck works, take a look at the book [Functional Programming in Scala](https://www.manning.com/books/functional-programming-in-scala). Chapter eight walks the reader through designing a similar library from scratch.

[^1]: QuickCheck [pioneered](https://doi.org/10.1145/351240.351266) property testing.
[^2]: You might want to write regression tests to verify `encode(decode(js)) == js`.
[^3]: For example, the associative, identity, and commutative laws of vector addition are properties.
[^4]: Only joking. Even I won't be relying on the implementation.
[^5]: One caveat: The variety of JSON objects generated is dependent on how well `json` is written.
[^6]: Obtaining representative samples is hard. Larger arrays can encode exponentially more states than smaller ones, so should a sorting algorithm be tested more frequently with larger arrays?
[^7]: Specifically, it contains a top-down implementation of mergesort.
[^8]: Hint: Consider sorting a list of restaurants in a food delivery app:

    ```scala
    case class Venue(name: String, distance: Double, rating: Int)
    ```

    Ordering venues by customer rating and then by distance should _always_ have the same result as ordering venues by distance and breaking ties on rating.
