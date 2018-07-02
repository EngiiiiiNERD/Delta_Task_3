var mongoose = require("mongoose");

var InfoSchema = new mongoose.Schema({
       userinfo       : String,
       timeOfCreation : {type: Date , default : Date.now},
       secret_code    : String,
       appointment    : [
                    {
                   type:mongoose.Schema.Types.ObjectId,
                   ref:"Appointment"
                    }
           ],
});

module.exports = mongoose.model("Info",InfoSchema);