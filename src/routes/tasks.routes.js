const { Router } = require("express");
const taskController = require("../controllers/tasks.controller");
const router = Router();

router.route("/").get(taskController.list).post(taskController.create);

router.get("/priority/:level", taskController.getByPriority);

router
  .route("/:id")
  .get(taskController.get)
  .put(taskController.update)
  .delete(taskController.remove);

module.exports = router;
