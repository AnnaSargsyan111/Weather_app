import { useMemo, useState } from "react";
import { PiThumbsUpBold, PiThumbsUpFill, PiThumbsDownBold, PiThumbsDownFill, PiArrowSquareOutBold, PiGlobeBold } from "react-icons/pi";
import { useWeatherNews } from "../../hooks/useWeatherNews.js";
import { formatRelativeTime } from "../../utils/relativeTime.js";
import styles from "./WeatherNews.module.css";

const CATEGORIES = ["All News", "Global Warming", "Climate Change"];

function NewsCard({ article, reaction, onVote }) {
  return (
    <div className={styles.card}>
      <a href={article.link} target="_blank" rel="noopener noreferrer" className={styles.thumbnailLink}>
        {article.thumbnail ? (
          <img src={article.thumbnail} alt="" className={styles.thumbnail} loading="lazy" />
        ) : (
          <div className={styles.thumbnailFallback}>
            <PiGlobeBold size={32} aria-hidden="true" />
          </div>
        )}
      </a>

      <div className={styles.body}>
        <div className={styles.metaRow}>
          <span className={styles.source}>{article.source}</span>
          <span className={styles.time}>{formatRelativeTime(article.publishedAt)}</span>
        </div>

        <a href={article.link} target="_blank" rel="noopener noreferrer" className={styles.headline}>
          {article.title}
        </a>

        <div className={styles.footer}>
          <button
            type="button"
            className={`${styles.reactionButton} ${reaction.voted === "like" ? styles.reactionActive : ""}`}
            onClick={() => onVote(article.id, "like")}
            aria-pressed={reaction.voted === "like"}
          >
            {reaction.voted === "like" ? <PiThumbsUpFill size={15} /> : <PiThumbsUpBold size={15} />}
            {reaction.like}
          </button>
          <button
            type="button"
            className={`${styles.reactionButton} ${reaction.voted === "dislike" ? styles.reactionActive : ""}`}
            onClick={() => onVote(article.id, "dislike")}
            aria-pressed={reaction.voted === "dislike"}
          >
            {reaction.voted === "dislike" ? <PiThumbsDownFill size={15} /> : <PiThumbsDownBold size={15} />}
            {reaction.dislike}
          </button>
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLink}
            aria-label="Read full article"
          >
            <PiArrowSquareOutBold size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function WeatherNewsSection({ loading, articles, error }) {
  const [activeCategory, setActiveCategory] = useState("All News");
  const [reactions, setReactions] = useState({});

  const filtered = useMemo(() => {
    if (!articles) return [];
    if (activeCategory === "All News") return articles;
    return articles.filter((a) => a.category === activeCategory);
  }, [articles, activeCategory]);

  function handleVote(id, choice) {
    setReactions((prev) => {
      const current = prev[id] ?? { like: 0, dislike: 0, voted: null };
      const alreadyVoted = current.voted === choice;

      const next = { ...current };
      if (current.voted) next[current.voted] -= 1;
      if (!alreadyVoted) {
        next[choice] += 1;
        next.voted = choice;
      } else {
        next.voted = null;
      }

      return { ...prev, [id]: next };
    });
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Weather news</h2>
        <div className={styles.filters}>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              className={`${styles.filterButton} ${activeCategory === category ? styles.filterButtonActive : ""}`}
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading && !articles ? (
        <p className={styles.statusText}>Loading news…</p>
      ) : error ? (
        <p className={styles.statusText}>{error}</p>
      ) : filtered.length === 0 ? (
        <p className={styles.statusText}>No articles in this category right now.</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              reaction={reactions[article.id] ?? { like: 0, dislike: 0, voted: null }}
              onVote={handleVote}
            />
          ))}
        </div>
      )}
    </div>
  );
}
