import "./styles/main.scss";
import AirDatepicker from "air-datepicker";
import "air-datepicker/air-datepicker.css";
import localeEn from "air-datepicker/locale/en";

document.addEventListener("DOMContentLoaded", () => {
  // data
  document.querySelectorAll(".date_controls").forEach((wrap) => {
    const input = wrap.querySelector("input");
    const clearBtn = wrap.querySelector(".datepicker--clear");
    const calendarBtn = wrap.querySelector(".datepicker--calendar");

    const dp = new AirDatepicker(input, {
      locale: localeEn,
      dateFormat(date) {
        const d = String(date.getDate()).padStart(2, "0");
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const y = date.getFullYear();
        return `${d}.${m}.${y}`;
      },
      autoClose: true,
    });

    if (input.id === "date-to") {
      dp.selectDate(new Date(2016, 7, 9));
    }

    clearBtn?.addEventListener("click", () => {
      dp.clear();
    });

    calendarBtn?.addEventListener("click", () => {
      dp.show();
    });
  });

  //  VIEW TOGGLE
  const gridBtn = document.querySelector(".view_btn--grid");
  const listBtn = document.querySelector(".view_btn--list");
  const container = document.querySelector(".posts_container");

  function setGridView() {
    container.classList.remove("posts_container--list_view");
    container.classList.add("posts_container--grid_view");
    gridBtn.classList.add("active");
    listBtn.classList.remove("active");
  }

  function setListView() {
    container.classList.remove("posts_container--grid_view");
    container.classList.add("posts_container--list_view");
    listBtn.classList.add("active");
    gridBtn.classList.remove("active");
  }

  function checkViewByWidth() {
    if (window.innerWidth <= 640) {
      setGridView();
    }
  }

  window.addEventListener("resize", checkViewByWidth);

  // onload
  checkViewByWidth();

  gridBtn?.addEventListener("click", () => setGridView());
  listBtn?.addEventListener("click", () => {
    if (window.innerWidth <= 640) return; // ← на малих екранах list не дозволяємо
    setListView();
  });
  // load more
  const ITEMS_PER_PAGE = 8;
  const TOTAL = 40;
  let currentId = 10; // 1-9 вже є в HTML

  const list = document.querySelector(".posts_list");
  const loadMoreBtn = document.querySelector(".btn_load_more");

  function createCard(id) {
    return `
        <li class="posts_item">
            <article class="post_card">
                <div class="post_preview">
                    <picture>
                        <img
                            src="https://picsum.photos/300/300?random=${id}"
                            alt="Content image"
                            loading="lazy">
                    </picture>
                </div>
                <div class="post_content">
                    <div class="post_meta_left">
                        <h2>Today</h2>
                        <div class="post_engagement">
                            <span class="engagement_item">
                                <svg width="15" height="14"><use href="/sprite.svg#icon-heart"></use></svg>
                                ${Math.floor(Math.random() * 300)}
                            </span>
                            <span class="engagement_item">
                                <svg width="15" height="14"><use href="/sprite.svg#icon-comments"></use></svg>
                                ${Math.floor(Math.random() * 60)}
                            </span>
                        </div>
                    </div>
                    <div class="post_meta_center">
                        <time class="post_date">9-08-2016</time>
                        <div class="post_engagement">
                            <span class="engagement_item">
                                <svg width="15" height="14"><use href="/sprite.svg#icon-heart"></use></svg>
                                ${Math.floor(Math.random() * 100)}
                            </span>
                            <span class="engagement_item">
                                <svg width="15" height="14"><use href="/sprite.svg#icon-comments"></use></svg>
                                ${Math.floor(Math.random() * 30)}
                            </span>
                        </div>
                    </div>
                    <div class="post_meta_right">
                        <span class="post_action_type">Image upload</span>
                        <time class="post_action_date">11-04-2016</time>
                    </div>
                </div>
            </article>
        </li>`;
  }

  loadMoreBtn?.addEventListener("click", () => {
    const end = Math.min(currentId + ITEMS_PER_PAGE, TOTAL + 1);

    for (let id = currentId; id < end; id++) {
      list.insertAdjacentHTML("beforeend", createCard(id));
    }

    currentId = end;

    if (currentId > TOTAL) {
      loadMoreBtn.hidden = true;
    }
  });
});
