<template>
  <div id="admin-dashboard">
    <b-sidebar
      position="static"
      mobile="reduce"
      type="is-light"
      fullheight
      open
    >
      <div id="padded-content">
        <b-menu class="is-custom-mobile">
          <b-menu-list label="Content">
            <b-menu-item icon="text-box" label="Articles" v-model="section_articles"></b-menu-item>
            <b-menu-item icon="pencil" label="Drafts" v-model="section_drafts"></b-menu-item>
            <b-menu-item icon="archive" label="Archives" v-model="section_archives"></b-menu-item>
            <b-menu-item icon="delete" label="Trash" v-model="section_trash"></b-menu-item>
          </b-menu-list>
          <b-menu-list label="Actions">
            <b-menu-item icon="logout" label="Logout"></b-menu-item>
          </b-menu-list>
        </b-menu>
      </div>
    </b-sidebar>
  
    <ArticlesTable />
  </div>
</template>

<script>
export default {
  layout: "admin",
  data() {
    return {
      section_articles: true,
      section_drafts: false,
      section_archives: false,
      section_trash: false,
    };
  },
  methods: {
    click_new() {
      this.$buefy.dialog.confirm({
        message: "Are you sure you want to make a new draft?",
        type: "is-success",
        onConfirm: () => this.new_draft(),
      });
    },
    async new_draft() {
      const new_id = await this.$axios
        .$post("/api/admin/draft")
        .then((draft) => draft.id)
        .catch((e) => console.log(e.stack));
      this.$router.push(`/admin/draft/${new_id}`);
    },
    confirm(f, verb, id, title) {
      this.$buefy.dialog.confirm({
        type: "is-danger",
        hasIcon: true,
        message: `Are you sure you want to ${verb} the article "${title}"?`,
        type: "is-danger",
        onConfirm: () => f(id),
      });
    },
    archive() {},
    unpublish() {},
    delete_article() {},
  },
  async fetch() {
    this.total = await this.$axios
      .$get("/api/admin/articles/count")
      .then((res) => res.count)
      .catch((e) => console.log(e.stack));
    this.articles = await this.$axios
      .$get("/api/admin/articles")
      .catch((e) => console.log(e.stack));
  },
};
</script>

<style scoped lang="scss">
@import "~bulma/sass/utilities/initial-variables";

#admin-dashboard {
  display: flex;
  height: calc(100vh - 68px);
  overflow: hidden;
}

#dashboard-content {
  overflow: scroll;
}

#padded-content {
  padding: 0.75rem;
}

.b-sidebar {
  display: flex;
  flex-direction: row;
  min-height: 100%;
  text-align: left;
  margin-right: 24px;
  z-index: 0;
}

#dashboard-content {
  flex-grow: 1;
}

/deep/ {
th {
  vertical-align: bottom;
}

tbody td {
  vertical-align: middle;
}
}

@media screen and (max-width: $tablet) {
  #padded-content {
    padding: 0.25rem;
  }

  .b-sidebar {
    margin-right: 12px;
  }
}
</style>