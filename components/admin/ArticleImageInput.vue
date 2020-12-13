<template>
  <div class="field is-horizontal">
    <div class="field-label is-normal">
      <label class="label">Image</label>
    </div>
    <div class="field-body">
      <div class="field">
        <p id="control-area" class="control has-icons-right">
          <input
            readonly
            class="input"
            :value="value"
            @click="showModal = true"
          />

          <span @click="$emit('input', null)">
            <font-awesome-icon
              size="xs"
              :icon="['fas', 'times-circle']"
              class="icon is-right"
              style="font-size: 0.6em; top: 20%; right: 8px"
            />
          </span>
        </p>
      </div>
    </div>

    <b-modal v-model="showModal" :width="464">
      <div class="card">
        <nav class="panel">
          <div class="panel-heading">
            <p>Select an image</p>
            <b-button
              id="panel-heading-upload"
              icon-left="plus"
              type="is-success"
              >Upload</b-button
            >
          </div>
          <div class="panel-block">
            <p class="control has-icons-left">
              <input class="input" type="text" placeholder="Search" />
              <font-awesome-icon
                size="xs"
                :icon="['fas', 'search']"
                class="icon is-left"
                style="font-size: 0.4em; top: 30%; left: 16px"
              />
            </p>
          </div>
          <div id="image-grid" class="columns is-multiline is-1">
            <div
              v-for="file in files[page-1]"
              :key="file"
              class="column is-half-mobile is-half-tablet is-one-third-desktop"
            >
              <p @click="select(file)" class="image is-square">
                <img :src="file" />
              </p>
            </div>
          </div>
          <div id="page-control">
            <b-button @click="set_page(page - 1)" v-show="page > 1">
              <font-awesome-icon
                size="1x"
                :icon="['fas', 'arrow-left']"
                class="icon"
                style="margin-top: 5px"
              />
            </b-button>
            <p>Page {{ page }}</p>
            <b-button @click="set_page(page + 1)" v-show="(page + 1 < files.length) || next_page_token != null">
              <font-awesome-icon
                size="1x"
                :icon="['fas', 'arrow-right']"
                class="icon"
                style="margin-top: 5px"
              />
            </b-button>
          </div>
        </nav>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "ArticleMetaInput",
  props: {
    value: String,
  },
  data() {
    return {
      showModal: false,
      page: 1,
      files: [],
      next_page_token: ''
    };
  },
  methods: {
    set_page(page) {
      if (this.page === page || page < 1) return;
      this.page = page;
      const real_page = page - 1;
      if (this.files.length <= real_page) {
        this.$fetch();
      }
    },
    select(file) {
      this.$emit('input', file);
      this.showModal = false;
    }
  },
  async fetch() {
    const real_page = this.page - 1;
    const query = (this.next_page_token == '') ? '' : `?page_token=${this.next_page_token}`;
    this.next_page_token = null;
    await this.$axios
      .$get(`/api/admin/storage${query}`)
      .then(res => {
        this.files.push(res.files.map(file => file.replace(/^static\//gi, '/static_files/')))
        this.next_page_token = res.next_page_query?.pageToken;
      })
      .catch(e => console.log(e.stack))
  }
};
</script>

<style lang="scss" scoped>
@import "~bulma/sass/utilities/initial-variables";

.panel-heading {
  display: flex;
  align-items: center;

  p {
    display: inline;
  }

  button {
    margin-left: auto;
    order: 2;
  }
}

#image-grid {
  padding: 8px;
  margin-bottom: 0;

  .image {
    overflow: hidden;
    cursor: pointer;

    img {
      height: unset;
      width: unset;
    }
  }
}

#page-control {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 16px;

  p {
    margin: 0 8px;
  }
}

#control-area {
  display: flex;
  padding-right: 8px;

  span {
    display: inline-block;
    width: 2em;
    height: 2em;
  }
}

@media screen and (max-width: $desktop) {
  #drop-text {
    font-size: 23px;
  }
}
</style>