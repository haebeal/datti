import "../utils";

using TypeSpec.Http;
using Utils;

namespace DattiApi;

/**
 * ユーザー 
 */
model User {
  id: string;
  name: string;
  avater: url;
  email: string;
}
