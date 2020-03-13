/*  Build template string with posts and return that when it will be done   */

self.addEventListener("message", e => {
    if (e.data) {
        let postsHTML = ``;

        e.data.forEach(post => {
            const date = new Date(post.created_at);
            const postHTML = `
                <div class="post">
                    <div class="post__title"><<a href="${post.url}">${post.title || 'Post Title'}</a></div>
                    <div class="post__info"><span>${post.author || 'Author'} | points: ${post.points || 0}</span><span>Comments: ${post.num_comments || 0}</span></div>
                    <div class="post__created"><span>${date.getDate()}:${date.getMonth()}:${date.getFullYear()}</span></div>
                </div>
            `;

            postsHTML += postHTML;
        });

        postMessage({
            postsHTML
        });
    }
});