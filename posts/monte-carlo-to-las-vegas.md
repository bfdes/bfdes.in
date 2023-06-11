---
title: Monte Carlo to Las Vegas
tags: [Algorithms, API]
created: 2019-06-15
summary: Trading performance for code reuse and readability in algorithm API design
---

Recently I wrote an algorithms library while following Computer Science courses to understand better the fundamental data structures that underpin modern computing. In the process, I gained an appreciation of the benefits of good API design.

Sometimes the goal of exposing a lean library API conflicts with that of writing performant code. Let's look at one such situation I encountered when adding a substring search algorithm to [Collections](https://github.com/bfdes/Collections).

## Monte Carlo algorithms

Monte Carlo algorithms are those which we can guarantee to terminate in finite time but which may yield an incorrect result now and then.[^1] On the other hand, a Las Vegas algorithm is guaranteed to produce a correct result, but we might only be able to obtain a probabilistic measure of its runtime.

It is possible to formulate a Las Vegas variant of an algorithm from the Monte Carlo variant in some cases. The Rabin-Karp substring search algorithm has this property.

## Substring search

Substring search algorithms let us find the position of a search string or pattern `p` within a larger piece of text `t`. Suppose our library exposes them as [curried functions](https://en.wikipedia.org/wiki/Currying)

$$
f : p \mapsto t \mapsto i,
$$

where $i \in I$ if the search string appears as a substring in the text, and $i = -1$ otherwise.[^2]

Example usage in Python:

```python
>>> find("needle")("It's like looking for a needle in a haystack")
24
>>> find("nettle")("It's like looking for a needle in a haystack")
-1
```

The naïve or brute force algorithm loops through every character of search text and attempts to match the search string against the next `len(p)` characters encountered:

```python
def find(pattern):
  m = len(pattern)

  def search(text):
    n = len(text)
    for i in range(0, n):
      if pattern == text[i : i + m]:
        return i
    return -1

  return search
```

It performs poorly for large text input.[^3] We can do much better by using something like Rabin-Karp search.[^4]

Our goal is to enable the client to write the Las Vegas variant of Rabin-Karp in terms of the Monte Carlo variant so that the library only has to export one implementation.

## Rabin-Karp

The Rabin-Karp algorithm attempts to find the search string by computing a rolling hash of successive substrings in the search text.[^5] The Monte Carlo variant returns the index that defines the first substring with a hash matching that of the pattern -- if one exists. Note that a hash collision can result in a false positive match.

Looking at code will make the idea clear. Here is a Python implementation of Rabin-Karp:

```python
# rabin_karp.py

def find(pattern):
  r = 256  # Search over ASCII characters
  q = 997  # Large prime number
  m = len(pattern)

  def hash(s):
    # Hash the first m characters of s
    h = 0
    for c in s[:m]:
      h = (h * r + ord(c)) % q
    return h

  pattern_hash = hash(pattern)

  def search(text):
    # Compare the rolling hash to the pattern hash
    text_hash = hash(text)
    n = len(text)
    if text_hash == pattern_hash:
      return 0

    # Precompute r^(m-1) % q for use in removing leading digit
    R = 1
    for _ in range(1, m):
      R = (r * R) % q

    for i in range(m, n):
      # Remove contribution from the leading digit,
      text_hash = (text_hash + q - R * ord(text[i - m]) % q) % q
      # and add contribution from the trailing digit
      text_hash = (text_hash * r + ord(text[i])) % q
      if text_hash == pattern_hash:
        return i - m + 1
    return -1  # Not found

  return search
```

The Las Vegas variant additionally performs an equality check to verify that the strings `pattern` and `text[i-m:i]` are the same before returning from the search loop. But this is equivalent to modifying the Monte Carlo variant to call itself on the remaining portion of text if an equality check fails, viz:

```python
def find(pattern):
  m = len(pattern)

  def search(text, start=0):
    i = rabin_karp.find(pattern)(text[start:])
    if i == -1:
      return -1
    if pattern == text[start + i : start + i + m]:
      return start + i
    return search(text, start + i + 1)

  return search
```

So it looks like library consumers can quickly adapt the Monte Carlo variant of the algorithm to create the Las Vegas form if needed.

## Engineering tradeoffs

It is very hard to get a free lunch.[^6] In this case, reusing code can lead to performance and memory usage issues when search text contains **lots** of false-positive matches.

Each false positive match encountered when `find` executes

1. creates an extra stack frame, and
2. results in the rolling hash within `rabin_karp.find` being reinitialized.

We can deal with the first problem by simply rewriting `find` in an iterative fashion:[^7]

```python
def find(pattern):
  m = len(pattern)

  def search(text):
    start = 0
    while True:
      i = rabin_karp.find(pattern)(text[start:])
      if i == -1:
        return -1
      if pattern == text[start + i : start + i + m]:
        return start + i
      start = start + i + 1

  return search
```

We can only solve the second problem by writing the implementation from scratch.

The library can support just the Monte Carlo implementation if it is not likely to be used when false positive matches are unacceptable. Unfortunately, generally speaking, library authors cannot be sure that developers will [RTFM](https://en.wikipedia.org/wiki/RTFM).

## Acknowledgements

I want to thank the people who reviewed the first draft of this blog post. [Adil Parvez](https://adilparvez.com) helped me define the tone of the article, and [Scott Williams](https://scottw.co.uk) pointed out that it is, in fact, _always_ possible to go from a Las Vegas variant of an algorithm to a Monte Carlo variant.[^8]

[^1]: More precisely, the result of a Monte Carlo algorithm may be incorrect with a _known_ probability.
[^2]:
    This API is the best for Rabin-Karp because it enables a _small_ optimization: the user can choose to [memoize](https://en.wikipedia.org/wiki/Memoization) the search string hash. For example, in

    ```python
    >>> search = find("needle")
    >>> search("It's like looking for a needle in a haystack")
    24
    >>> search("It's like a wild goose chase")
    -1
    ```

    `"needle"` has only been hashed once.

[^3]: The runtime is $$O(mn)$$, where $$m$$, $$n$$ are the pattern and search text lengths, respectively.
[^4]: Boyer-Moore and Knuth-Morris-Pratt search algorithms are also effective alternatives.
[^5]: The course [Algorithms I](https://www.coursera.org/learn/algorithms-part1) does an excellent job of explaining how Rabin-Karp works.
[^6]: Unless you work at Google :P
[^7]: We can get away with using recursion when working in a language that supports tail-call optimization. Unfortunately, [Python does not](https://stackoverflow.com/a/13592002).
[^8]: An absurd way of implementing a Monte Carlo variant of Rabin-Karp given a Las Vegas variant is to return the correct index on every other invocation and a random one otherwise.
