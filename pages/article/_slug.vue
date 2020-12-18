<template>
  <div class="article">
    <section class="section">
      <div class="container">
        <ArticleHeader :title="title" :author="author" :description="description" />
        <div class="columns">
          <div class="column"></div>
          <div class="column is-three-quarters has-text-left">
            <ArticleContent :content="content" />
            <ShareTags :category="category" :tags="tags" />
          </div>
          <div class="column"></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import ArticleContent from '@/components/article/ArticleContent.vue';
import ArticleHeader from '@/components/article/ArticleHeader.vue';

export default {
  name: 'Home',
  components: {
    ArticleContent,
    ArticleHeader,
  },
  data() {
    return {
      title: 'What is a Sonata?',
      author: 'Henry Sloan',
      description:
        'Many of the most popular classical works are "Sonatas". Let\'s look at what that means, and how we can navigate this vast genre.',
      category: 'Article',
      tags: ['Sonata', 'Baroque', 'Classical', 'Romantic'],
      content: `
[[toc]]

# Introduction
What do Mozart and Beethoven have in common? Well, among other things, they both have "sonatas" among their most famous works. I'll bet you've heard this piece by Mozart:

<audio controls="controls" src="https://upload.wikimedia.org/wikipedia/commons/3/38/Wolfgang_Amadeus_Mozart_-_sonata_no._16_in_c_major%2C_k.545_%27sonata_facile%27_-_i._allegro.ogg"></audio>

And this wild work of Beethoven:

<audio controls="controls" src="https://upload.wikimedia.org/wikipedia/commons/1/1d/Moonlight_Sonata_Presto.ogg"></audio>

These two pieces are about as different as you can get within the classical-era piano repertoire, but they have **two things** in common.
1. They're movements in "piano sonatas"
2. They're in sonata form

That's right, "sonata" means two different, but closely related, things. This might seem confusing, but learning the meanings of these two ideas will do wonders to open your ears to classical music. Let's look at the definitions of "sonata" and see how this abstract idea leads us through the past 400 years of musical evolution.

# Sonata vs. Sonata Form
What is the difference? There is a difference. What is it. It is.

# History of the Sonata
There is history. What is it? It is.

# Suggestions
Listen! To what? Well, listen, and I'll tell you! It is.
`,
    };
  },
};
</script>

<style scoped lang="scss">
@import "~bulma/sass/utilities/initial-variables";

#title-area {
  display: flex;
  justify-content: center;
}

.section {
  padding-top: 1.75rem;
}

@media screen and (max-width: $tablet) {
  .column:empty {
    display: none;
  }
}
</style>