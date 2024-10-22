const Message = require("../models/message");

module.exports.contact_get = (req, res) => {
  res.render("contact.ejs", {});
};

module.exports.contact_post = async (req, res) => {
  const { fullName, email, message } = req.body;
  console.log(fullName, email, message);
  try {
    const newMessage = new Message({ fullName, email, message });
    await newMessage.save();
    res.redirect("contact");
  } catch (err) {
    console.log(err);
  }
};

module.exports.message_get = async (req, res) => {
  try {
    const messages = await Message.find();

    res.render("message", {
      messages,
    });
  } catch (err) {
    console.log(err);
  }
};
