
module.exports = {
  Query: {
    reservation: async (_, { }, { container }) => {
      return 'reservation';
    },
  
  },

  Mutation : {
    sendExamimationReservationMessage: async (_, {reservation}, { container, req }) => {
      // const zaloInterestedUserProvider = container.resolve('zaloReservationProvider');

      // await zaloInterestedUserProvider.create(reservation)

      const zaloMessageSender = container.resolve('zaloMessageSender');

      const response = await zaloMessageSender.sendMessage({
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "list",
            "elements": [
              {
                "title": "Xác nhận book lịch đi khám",
                "subtitle": "Xin vui lòng xác nhận lịch đi khám vào ngày 08-05-2020",
                "image_url": "https://vn112.com/wp-content/uploads/2019/03/dentist-1552158168plc84.jpg",
                "default_action": {
                  "type": "oa.open.url",
                  "url": "https://developers.zalo.me/docs/api/official-account-api-147"
                }
              },
              {
                "title": "Bạn chọn đi khám",
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/7/77/Yes.png",
                "default_action": {
                  "type": "oa.open.url",
                  "url": "https://3e5d6313.ngrok.io/api/zalo/handlerClick?type=examination&userId=5953238198052633581&doctorId=1084886643066379263&choose=true&time=1588903306"
                }
              },
              {
                "title": "Bạn không đi khám ",
                "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSohjWSNyMtM3HlRxUT4mNqXFfBMqe527A6zv5YS_3Ljxn4AHmM&usqp=CAU",
                "default_action": {
                  "type": "oa.open.url",
                  "url": "https://3e5d6313.ngrok.io/api/zalo/handlerClick?type=examination&userId=5953238198052633581&doctorId=1084886643066379263&choose=false&time=1588903306"
                }
              }
            ]
          }
        }
      }, {zaloId: "5953238198052633581"});


      return '12313';
    },
  }
};
