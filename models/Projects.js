const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  projects: [
    {
      name: {
        type: String,
        uppercase: true,
        required: true,
      },
      developmentPercentage: {
        type: Number,
        required: true,
      },
      tasks: {
        development: [
          {
            description: {
              type: String,
              required: true,
            },
            percentage: {
              type: Number,
              required: true,
            },
            complete: {
              type: Boolean,
              default: false,
            },
          },
        ],
      },
    },
  ],
});

module.exports = Project = mongoose.model("project", ProjectSchema);
