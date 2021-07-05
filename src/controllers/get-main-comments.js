export default function makeGetMainComments ({ listMainComments }) {
    return async function getComments (httpRequest) {
      const headers = {
        'Content-Type': 'application/json'
      }
      try {
        const postComments = await listMainComments({
          postId: httpRequest.query.postId
        })
        return {
          headers,
          statusCode: 200,
          body: postComments
        }
      } catch (e) {
        // TODO: Error logging
        console.log(e)
        return {
          headers,
          statusCode: 400,
          body: {
            error: e.message
          }
        }
      }
    }
  }
  