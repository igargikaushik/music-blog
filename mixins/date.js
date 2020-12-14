export default {
  methods: {
    date(timestamp) {
      let date_obj = new Date(timestamp + " UTC");
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      };
      return date_obj.toLocaleDateString("en-US", options);
    },
  }
}