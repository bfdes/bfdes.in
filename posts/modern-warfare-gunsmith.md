---
title: Modern Warfare Gunsmith
tags: [Combinatorics]
created: 2019-12-05
summary: Applying combinatorial optimization to competitive multiplayer video game strategy
---

[Gunsmith](https://blog.activision.com/call-of-duty/2019-09/A-Deeper-Look-at-Modern-Warfare-Customization) is a weapon customization system in the [first-person shooter](https://en.wikipedia.org/wiki/First-person_shooter) franchise Call Of Duty. The latest entry in the Call Of Duty series, Modern Warfare, takes weapon customization further than its predecessors.

Call Of Duty pits players against each other in deathmatch or objective capture game modes. Good gunplay and weapon customization are vital to the competitive experience. Your loadout can make or break a match.

I wondered whether it would be possible to determine the "best" loadout without trying out every weapon.

## Gunsmith

In the game world, each weapon has attributes that determine how it handles. Attributes include but are not limited to weapon range, damage, and recoil.

For the sake of balance, there are no overpowered weapons.[^1] For example, submachine guns, which impart less recoil than assault rifles, have poor maximum effective range.[^2]

The following table compares an MP5 submachine gun to an M4A1 [carbine](https://en.wikipedia.org/wiki/Carbine):

|      | range | damage | recoil control | maneuverability |
| ---- | :---: | :----: | :------------: | :-------------: |
| MP5  |   5   |   4    |       7        |        6        |
| M4A1 |   7   |   4    |       4        |        4        |

Note that values in the table are not real; they are merely for illustration.

In Gunsmith, players can add attachments to a weapon to create a loadout. Each attachment or modification enhances some attributes but degrades others. Again, for game balance.

For example, an MP5K is more maneuverable than an MP5, owing to its short barrel.[^3] But, for the same reason, an MP5K suffers from high recoil. Depending on how you play, this might be an acceptable tradeoff.

|      | range | damage | recoil control | maneuverability |
| ---- | :---: | :----: | :------------: | :-------------: |
| MP5  |   5   |   4    |       7        |        6        |
| MP5K |   4   |   4    |       5        |        8        |

## Player Utility

To get anywhere, we need to quantify the preference a player has for a loadout.

Humor me for a moment. Imagine we have a function

$$
 U: \R^n \to \R
$$

that does just this.[^4] It maps the set of attribute vectors to the set of real numbers. The higher the value $U(\mathbf{x})$, the greater the user's preference for a loadout with attributes $\mathbf{x}$.[^5]

Recognize that $U$ represents microeconomic [utility](https://en.wikipedia.org/wiki/Utility). Effectively, we seek to maximize utility subject to constraints imposed by game mechanics.

We can safely assume two things:

1. Each attribute contributes independently to utility

$$
U(\mathbf{x}) = \displaystyle\sum_i U_i(x_i)
$$

2. Large attribute values are always better than small ones[^6]

$$
\dfrac{\partial U}{\partial x_i} > 0 \ \forall \ i
$$

The attribute vector consists of base weapon attributes $\mathbf{x_0}$ and the sum of contributions from attachments. If we denote the presence of the $j$-th attachment in the $i$-th slot by a boolean variable $X_{ij} \in \{0, 1\}$, we can write

$$
\mathbf{x} = \mathbf{x_0} + \displaystyle\sum_i^m \displaystyle\sum_j^{n_i} X_{ij}\mathbf{\Delta x}_{ij}
$$

Here

- $n_i$ is the number of attachments you can put into the $i$-th slot, and
- $m$ is the number of weapon slots.

Game mechanics impose two constraints:

1. The player is restricted to five modifications

$$
\displaystyle\sum_i^m \displaystyle\sum_j^{n_i} X_{ij} \leq 5
$$

2. Each "slot" can only accept one attachment

$$
\displaystyle\sum_j^{n_i} X_{ij} \leq 1 \ \forall \ i
$$

## Combinatorial optimization

How many ways $N$ are there to modify a typical weapon?

[Combinatorics](https://en.wikipedia.org/wiki/Combinatorics) can help us obtain bounds on $N$.

Suppose every slot supports at least three modifications, and every weapon has at least seven slots.

$$
\begin{aligned}
  \implies  N &\geq \displaystyle\sum_{k=0}^5 \binom{7}{k} 3^k \\
              &= 9,094
\end{aligned}
$$

Now suppose $n_i \leq 9 \ \forall \ i$ and $m \leq 8$.

$$
\begin{aligned}
  \implies  N &\leq \displaystyle\sum_{k=0}^5 \binom{8}{k} 9^k \\
              &= 3,809,179
\end{aligned}
$$

That's a lot of permutations! Even so, a modern computer can churn out solutions by brute force in good time, whatever the utility function. Nevertheless, we should avoid an exhaustive search if possible.

We can propose a simple closed-form expression for utility with some insight from gamers. Ask any player whether they appreciate each increase in, say, accuracy less than a previous increase. They will disagree vehemently.[^7]

Hence,

$$
  \dfrac{\partial^2 U}{\partial x_i^2} = 0 \ \forall \ i
$$

, which implies

$$
  U(\mathbf{x}) = \sum_i u_i x_i + u_0
$$

$u_i$ represents the change in utility for every unit change in attribute $x_i$. Note that $u_i > 0 \ \forall \ i$ due to the non-satiation assumption.

Since we are concerned with [ordinal utility](https://en.wikipedia.org/wiki/Ordinal_utility), we can drop the constant term $u_0$ and write

$$
  U(\mathbf{x}) = \sum_i u_i x_i = \mathbf{u} \cdot \mathbf{x}
$$

By happy accident, this linear mapping $U$ makes our optimization problem tractable!

## The Knapsack Problem

Observe that we can write $U(\mathbf{x})$ in terms of boolean variables:

$$
\begin{aligned}
  U(\mathbf{x}) &= \mathbf{u} \cdot \left(\displaystyle\sum_i^m \displaystyle\sum_j^{n_i} X_{ij}\mathbf{\Delta x}_{ij}  \right) + \mathbf{u} \cdot \mathbf{x_0} \\
                &= \displaystyle\sum_i^m \displaystyle\sum_j^{n_i} X_{ij} \times \mathbf{u} \cdot \mathbf{\Delta x}_{ij} + \mathbf{u} \cdot \mathbf{x_0} \\
                &= \displaystyle\sum_i^m \displaystyle\sum_j^{n_i} P_{ij} X_{ij} + \mathbf{u} \cdot \mathbf{x_0}
\end{aligned}
$$

, where $P_{ij} = \mathbf{u} \cdot \mathbf{\Delta x}_{ij}$.[^8]

Restating the whole problem, with constraints, for completeness:

$$
  \max \displaystyle\sum_i^m \displaystyle\sum_j^{n_i} P_{ij}X_{ij} + \mathbf{u} \cdot \mathbf{x_0}
$$

subject to

$$
\begin{aligned}
  \displaystyle\sum_i^m \displaystyle\sum_j^{n_i} X_{ij} &\leq 5 \\
  \displaystyle\sum_j^{n_i} X_{ij} &\leq 1 \ \forall \ i \\
  X_{ij} &\in \{0, 1\} \ \forall \ i, j
\end{aligned}
$$

Thus, the optimization problem reduces to a variant of the Multiple-Choice [Knapsack Problem](https://en.wikipedia.org/wiki/Knapsack_problem), where

- item value $P_{ij}$ may be a real number, and
- all items have the same weight.

Since every attachment has the same cost, we can write a simple greedy algorithm that solves the Knapsack Problem:

1. Sort the attachments in descending order of value `P[i][j]`
2. While slots are still available, select an attachment `(i, j)` provided:
   - its slot `i` is vacant, and
   - its value `P[i][j]` is positive

The following Java code implements this algorithm:

```java
public class WeaponOptimizer implements Optimizer<Weapon> {
  private final List<Double> utilityCoefficients;

  @Override
  public Pair<Double, Loadout> run(Weapon weapon) {
    var attachments = new ArrayList<Pair<Attachment, Double>>();
    for (var slot : weapon.slots())
      for (var attachment : slot.attachments()) {
        var price = attachment.price(utilityCoefficients);
        if (price > 0)
          attachments.add(new Pair<>(attachment, price));
      }

    attachments.sort(comparator);

    var utility = weapon.utility(utilityCoefficients);
    var loadout = new Loadout(weapon);
    for (var pair : attachments) {
      var attachment = pair.first;
      var price = pair.second;

      if (loadout.isFull())
        break;
      if (loadout.isFull(attachment.slot))
        continue;

      utility += price;
      loadout.put(attachment.slot, attachment);
    }
    return new Pair<>(utility, loadout);
  }
}
```

Sorting accounts for most of the running time of `run`. I did not translate the algorithm literally; there are a couple of practical improvements. `run` discards attachments of negative value before sorting. It also caches price calculations.

`Loadout` represents a weapon and all its attachments:

```java
public class Loadout {
  public static final int MAX_ATTACHMENTS = 5;

  public final Weapon weapon;
  private final Map<Slot, Attachment> attachments = new HashMap<>();

  public boolean isFull() {
    return attachments.size() == MAX_ATTACHMENTS;
  }

  public boolean isFull(Slot slot) {
    return attachments.containsKey(slot);
  }

  public void put(Slot slot, Attachment attachment) {
    if (!weapon.slots().contains(slot))
      throw new IllegalArgumentException();
    if (!slot.attachments().contains(attachment))
      throw new IllegalArgumentException();
    if (isFull())
      throw new UnsupportedOperationException();
    if (isFull(slot))
      throw new UnsupportedOperationException();
    attachments.put(slot, attachment);
  }
}
```

`put` ensures we don't

1. occupy a slot with a foreign attachment,
2. add more than five attachments to the weapon, or
3. populate a slot multiple times.

The algorithm we devised finds the best loadout for a given weapon. We can do better and determine the best loadout in the game.

Notice that attachment choice is tied to weapon choice. We should

1. maximize utility for every weapon independently and then
2. find the weapon with the highest utility

to get the best loadout:

```java
public class LoadoutOptimizer implements Optimizer<List<Weapon>> {
  private final Optimizer<Weapon> weaponOptimizer;

  @Override
  public Pair<Double, Loadout> run(List<Weapon> weapons) {
    return weapons
      .stream()
      .map(weaponOptimizer::run)
      .max(Comparator.comparing(Pair::first))
      .orElseThrow(IllegalArgumentException::new);
  }
}
```

`LoadoutOptimizer` accepts _any_ underlying optimizer implementing the `Optimizer<Weapon>` interface. We can [stub](https://en.wikipedia.org/wiki/Method_stub) out `WeaponOptimizer` when testing `LoadoutOptimizer`.

## Model correctness

It is difficult to verify the usefulness of applying Consumer Theory to the study of Gunsmith. Weapon data is not publicly available; it has to be obtained by experiment. Data reported online is incomplete because data collection is so onerous.

[^1]: Players will claim otherwise!

[^2]: This is the case in real life, too.

[^3]: The K in [MP5K](https://www.heckler-koch.com/en/products/military/submachine-guns/mp5/mp5k/overview.html) stands for _Kurz_, German for "short."

[^4]: $n$ denotes the number of weapon attributes.

[^5]: Note that multiple loadouts can have the same attribute vector.

[^6]: In other words, the [nonsatiation assumption](https://en.wikipedia.org/wiki/Local_nonsatiation) of Consumer Theory holds.

[^7]: In other words, [marginal utility](https://en.wikipedia.org/wiki/Marginal_utility) does NOT diminish.

[^8]: $P_{ij}$ is the additional utility we derive from having the $j$-th slot populated with the $i$-th attachment.
