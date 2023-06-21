---
title: Spotify Wrapped
tags: [Analytics]
created: 2023-05-25
summary: Analyzing Spotify library data through the Spotify Web API
---

Spotify Wrapped is a viral marketing campaign by the music streaming service Spotify. At the end of every year, Spotify presents each user with a summary of their listening habits.[^1]

I set out to see whether users can execute Spotify Wrapped-like queries against the [Spotify Web API](https://developer.spotify.com/documentation/web-api). Before I embarked on my journey, I was unaware of third-party tools such as [stats.fm](https://stats.fm/).[^2]

Keep reading to know what is possible with a laptop and API access. Or use stats.fm.

## Keys to the Kingdom

Like any sane internet service, Spotify guards their public API with developer keys.[^3] In particular, Spotify implements the [OAuth 2.0](https://oauth.net/2/) authorization framework.

Go through the OAuth Authorization Code flow to allow a machine -- your laptop -- to act on your behalf. Spotify for Developers [documents the gory details](https://developer.spotify.com/documentation/web-api/tutorials/code-flow).

The result of the interaction should be an access token. API servers only respond to requests containing a valid access token.

## Data wrangling

Spotify organizes data in the following way:

- Every track is associated with an album
- Every track is associated with one or more artists
- Every album is an "album", a "single", or a "compilation"
- An album may be associated with one or more genres
- An artist may be associated with one or more genres

Categorizing tracks by genre is subjective. In practice, only artists, not albums, are assigned genres. More on that later.

Assuming you have a valid access token, you can call [the saved tracks endpoint](https://developer.spotify.com/documentation/web-api/reference/get-users-saved-tracks) to fetch "liked" tracks:

```shell
curl \
  --request GET \
  --url https://api.spotify.com/v1/me/tracks \
  --header 'Authorization: Bearer acc3sst0k3n'
```

Spotify pages the response for obvious reasons. Use your favourite scripting language to fetch the whole library.[^4]

Please be considerate and run your queries against cached data. Not directly against the Web API. I wrote the saved tracks API response to CSV files and loaded them into [SQLite](https://www.sqlite.org). The rest of this blog post will make sense if you do the same thing.

Each CSV file corresponds to an SQLite table. The table schemas mirror the way Spotify manages track data. Execute

```sql
create table album (
  album_id text primary key not null,
  name text not null,
  type text not null,
  release_year integer not null
);

create table artist (
  artist_id text primary key not null,
  name text not null
);

create table track (
  track_id text primary key not null,
  name text not null,
  album_id text not null references album(id)
);

create table track_artist (
  track_id text not null references track(track_id),
  artist_id text not null references artist(artist_id),
  primary key (track_id, artist_id)
);
```

to apply the schemas, and then load data with the following commands:

```
.import track.csv track --csv
.import album.csv album --csv
.import artist.csv artist --csv
.import track_artist.csv track_artist --csv
```

## Popular tracks

We can't determine the most streamed tracks from the Web API. It does not expose track play counts.[^5] Indeed, this is why the track table does not have a `play_count` column.

stats.fm records track play count on an ongoing basis. If you [import historical data](https://support.stats.fm/docs/import/), it displays play counts from the beginning of time.

## Popular albums

Let's define an album's popularity by the number of saved album tracks.

To find popular albums,

1. join each track to an album by its album ID,
2. group tracks by album, and
3. sort by frequency.

Here is a query that returns albums that have at least five tracks:

```sql
select album.name, count(*) as count
from track
join album using(album_id)
group by album_id
having count > 4
order by count desc, album.name;
```

Note that publishers can re-upload albums under a different ID. As far as I can see, this has two consequences:

1. Multiple Count: users save the same track multiple times
2. Split Count: users save different tracks across copies of an album

Neither of these phenomena is easy to notice while browsing Spotify.[^6] Unfortunately, they complicate our query and leave orphaned tracks in your library.

Group tracks by album name, not ID, to counteract Split Count:

```sql
select album.name, count(*) as count
from track
join album using(album_id)
group by album.name
having count > 4
order by count desc, album.name;
```

Deduplicate tracks by name to compensate for Multiple Count:

```sql
select album.name, count(distinct track.name) as count
from track
join album using(album_id)
group by album.name
having count > 4
order by count desc, album.name;
```

The last query outputs the table

|      Album       | Saved tracks |
| :--------------: | :----------: |
|      Lover       |      8       |
|  American Idiot  |      6       |
|  Back In Black   |      5       |
| Brothers In Arms |      5       |
|    Hard Road     |      5       |
|  Parallel Lines  |      5       |
|     Rumours      |      5       |
|  The Last Stand  |      5       |
|   Voulez-Vous    |      5       |
|        ÷         |      5       |

when run on my library. (Note: I've removed soundtracks.)

Lover by Taylor Swift is my favourite album :sweat_smile:. How embarrassing!

## Popular artists

The query to find popular artists is similar to that used to find popular albums. This time, you must join three tables:

```sql
select artist.name, count(distinct track.name) as count
from track
join track_artist using(track_id)
join artist using(artist_id)
group by artist_id
having count > 10
order by count desc, artist.name;
```

Artist profiles are almost immutable, so we don't have a Split Count problem. However, we have a Multiple Count problem. Address it in the same way as before -- deduplicate tracks by name.

This query outputs the table

|    Artist    | Saved tracks |
| :----------: | :----------: |
|  Elton John  |      21      |
|     ABBA     |      20      |
|   Sabaton    |      19      |
|    AC/DC     |      18      |
| Dire Straits |      18      |
| Taylor Swift |      18      |
| David Bowie  |      15      |
|  Ed Sheeran  |      13      |
|   Bee Gees   |      12      |
|    Queen     |      12      |
| The Killers  |      12      |
|  Take That   |      11      |

when run on my library.

The results are unsurprising. Almost all featured artists enjoy -- or have enjoyed -- enormous commercial success. Sabaton is the only unusual result.

## Favourite era

Let's define the popularity of an era by the number of library tracks published in that period.

You can find the number of tracks published per year by grouping tracks by publication year:

```sql
select release_year, count(distinct track.name) as count
from track
join album using(album_id)
group by release_year
order by count desc, release_year desc;
```

(2013 and 1984 were good years for music, at least as far as I am concerned.)

Counting library tracks by release decade is more instructive. You don't need a window function to achieve this. Notice that the release decade of a track is given by `release_year - release_year % 10`, so the query

```sql
select
  release_year - release_year % 10 as release_decade,
  count(distinct track.name) as count
from track
join album using(album_id)
group by release_decade
order by count desc, release_decade desc;
```

partitions tracks by release decade.

It outputs

| Decade | Saved tracks |
| :----: | :----------: |
|  1980  |     474      |
|  2010  |     457      |
|  2000  |     374      |
|  1970  |     274      |
|  1990  |     246      |
|  1960  |     104      |
|  2020  |      44      |
|  1950  |      11      |
|  1930  |      1       |
|   0    |      1       |

when run on my library.[^7]

This child of the 2000s is more interested in music from the 1980s.

## Favourite genre

No tracks, let alone albums, are tagged with genres. Suppose artists only perform music within their niche.[^8] In that case, you can safely label a track with the union of all its artists' genres.

The documentation for the saved tracks endpoint claims every track's `"artist"` key contains artist genres. I found this was not true. You will need to call [another endpoint](https://developer.spotify.com/documentation/web-api/reference/get-an-artist) to fetch artist genre information. If your library has $n$ artists, you will make $n$ API calls to determine your favourite genre.[^9]

Introduce a new table to represent the many-to-many relationship between artists and genres:

```sql
create table artist_genre(
  artist_id text not null references artist(artist_id),
  genre text not null,
  primary key (artist_id, genre)
)
```

Partition tracks by genres from this join table to figure out the most popular genres:

```sql
select genre, count(distinct track.name) as count
from track
join track_artist using(track_id)
join artist_genre using(artist_id)
group by genre
order by count desc, genre;
```

Rock, mainly classic rock, dominates my library:

|    Genre     | Saved tracks |
| :----------: | :----------: |
|     rock     |     516      |
| classic rock |     308      |
|  soft rock   |     303      |
|     pop      |     292      |
|  album rock  |     278      |
| mellow gold  |     267      |
|  hard rock   |     212      |
| new wave pop |     206      |

[^1]: Competing streaming platforms like Apple Music recognized the marketing value of Spotify Wrapped and introduced similar campaigns.
[^2]: [Apple Music Replay](https://music.apple.com/replay) is updated weekly. You do not need a third-party service to gain insight into listening habits on Apple Music.
[^3]: Granular rate limiting is only possible with API keys.
[^4]: Your favourite scripting language should be Python. Only joking :stuck_out_tongue:.
[^5]: However, you can get [a list of top tracks](https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks) based on Spotify's notion of popularity.
[^6]:
    You can find out whether Multiple Count affects you by comparing the output of

    ```sql
    select count(*) from track;
    ```

    to

    ```sql
    select count(distinct track.name) from track;
    ```

[^7]: Release year 0 is a sentinel value for an orphaned album in my library.
[^8]: I mean, Rammstein is unlikely to collaborate with Taylor Swift.
[^9]: Alternatively, [batch your requests](https://developer.spotify.com/documentation/web-api/reference/get-multiple-artists). You will make $ \left\lceil\dfrac{n}{50}\right\rceil$ API calls.
