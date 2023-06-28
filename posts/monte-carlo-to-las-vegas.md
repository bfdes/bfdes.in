---
title: Monte Carlo to Las Vegas
tags: [Algorithms, API]
created: 2019-06-15
summary: Trading performance for code reuse in algorithm API design
---

I recently wrote [an algorithms library](https://github.com/bfdes/collections) while following Computer Science courses to understand the fundamental data structures that underpin modern computing. In the process, I learned about the value of good API design.

Sometimes, the goal of exposing a lean library API conflicts with that of writing performant code. Let's look at a compromise I had to make when adding a substring search algorithm to the library.

## Monte Carlo algorithms

A Monte Carlo algorithm is guaranteed to terminate in finite time, but it may yield an incorrect result occasionally. Conversely, a Las Vegas algorithm produces a correct result only if it terminates.

In some cases, it is possible to formulate a Las Vegas variant of a Monte Carlo algorithm. The Rabin-Karp substring search algorithm has this property.

## Substring search

Substring search algorithms let us find the position of a search string or pattern `p` within a larger text `t`. Suppose our library exposes these algorithms as [curried functions](https://en.wikipedia.org/wiki/Currying)

$$
f : p \mapsto t \mapsto i
$$

, where

- $i \in I$[^1] if $$p$$ appears as a substring in $$t$$, and
- $i = -1$ otherwise.[^2]

Example usage in Python:

```python
>>> find("needle")("It's like looking for a needle in a haystack")
24
>>> find("nettle")("It's like looking for a needle in a haystack")
-1
```

The naïve or brute force algorithm walks through text, matching the search string against every substring of length `len(p)`:

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

It performs poorly for large text input.[^3] We can do much better by using Rabin-Karp search.[^4]

We aim to enable library users to write the Las Vegas variant of the Rabin-Karp algorithm in terms of the Monte Carlo variant. That way, our library only has to export one implementation of Rabin-Karp search.

## Rabin-Karp search

The Rabin-Karp algorithm attempts to find a search string by computing a rolling hash of text input.[^5] Its Monte Carlo variant returns the index that defines the first substring with a hash matching that of the search string. Note that a hash collision can result in a false positive match -- a spurious "hit."

Looking at a concrete implementation of Rabin-Karp search will make things clear. Here is the Monte Carlo variant, written in Python:

```python
def find(pattern):
  r = 256  # search over ASCII characters
  q = 997
  m = len(pattern)

  def hash(s):
    # Hash the first `m` characters of `s`
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

    # Precompute `pow(r, m - 1) % q`
    R = 1
    for _ in range(1, m):
      R = (r * R) % q

    for i in range(m, n):
      # Remove the contribution from the leading digit,
      text_hash = (text_hash + q - R * ord(text[i - m]) % q) % q
      # and add a contribution from the trailing digit
      text_hash = (text_hash * r + ord(text[i])) % q
      if text_hash == pattern_hash:
        return i - m + 1
    return -1

  return search
```

The Las Vegas variant performs an equality check to guard against spurious hits. It verifies the strings `pattern` and `text[i-m:i]` are the same before returning from the search loop. But this is equivalent to modifying the Monte Carlo variant to call itself on the remaining portion of text if an equality check fails, viz:

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

Thus library users can quickly adapt the Monte Carlo variant of the algorithm to create the Las Vegas variant.

## Engineering tradeoffs

It's hard to get a free lunch.[^6] In this case, reusing code can result in poor performance and excessive memory usage when a search leads to **many** spurious hits.

Each spurious hit:

1. creates an extra stack frame, and
2. reinitializes the rolling hash within `rabin_karp.find`.

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

We can only solve the second problem by writing `find` entirely from scratch.

The library can export the Monte Carlo implementation if it is not likely to be used when spurious hits are unacceptable. Unfortunately, library authors cannot be sure programmers will [RTFM](https://en.wikipedia.org/wiki/RTFM).

## Acknowledgments

I want to thank the people who reviewed the first draft of this blog post. [Adil Parvez](https://adilparvez.com) helped me define the tone of this article. [Scott Williams](https://scottw.co.uk) pointed out it is _always_ possible to go from a Las Vegas variant of an algorithm to a Monte Carlo variant.[^8]

[^1]: $$I = \{i \in \Z_0 : i < |t| \}$$
[^2]:
    This API is ideal for Rabin-Karp search. It enables a _small_ optimization: the library user can [memoize](https://en.wikipedia.org/wiki/Memoization) hashing. For example, `"needle"` has only been hashed once in

    ```python
    >>> search = find("needle")
    >>> search("It's like looking for a needle in a haystack")
    24
    >>> search("It's like a wild goose chase")
    -1
    ```

[^3]: The runtime is $$O(mn)$$, where $$m$$ and $$n$$ are the number of characters in the search string and the text input.
[^4]: Or Boyer-Moore search. Or Knuth-Morris-Pratt search.
[^5]: The course [Algorithms I](https://www.coursera.org/learn/algorithms-part1) does a fine job explaining how the Rabin-Karp algorithm works.
[^6]: Unless you work at Google :stuck_out_tongue:.
[^7]: We can get away with using recursion when working in a language that supports tail-call optimization. Unfortunately, [Python does not](https://stackoverflow.com/a/13592002) :cry:.
[^8]: An absurd way of implementing a Monte Carlo variant of Rabin-Karp given a Las Vegas variant is to return the correct index on every other invocation and a random one otherwise.
