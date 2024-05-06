import "../utils";

using TypeSpec.Http;
using Utils;

namespace DattiAPI;
/**
 * イベント情報に関する操作
 */
@tag("Events")
@route("groups/{gid}")
namespace Events {
  /**
   * 登録されているイベント情報の取得
   */
  @route("events/{id}")
  @summary("イベントIDに紐づくイベント情報の取得")
  @get
  op getEvent(@path gid: string, @path id: string):
  | Utils.Response.OKResponse<Event>
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * グループIDに紐づくイベント情報の取得
   */
  @route("events")
  @summary("グループIDに紐づくイベント情報の取得")
  @get
  op getEventsByGid(@path gid: string):
  | Utils.Response.OKResponse<EventsResponse>
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * イベント情報の登録
   */
  @route("events")
  @summary("イベント情報の登録")
  @post
  op createEvent(@path gid: string, @body event: EventCreateRequest):
  | Utils.Response.CreatedResponse<Event>
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * イベント情報の更新
   */
  @route("events/{id}")
  @summary("イベント情報の更新")
  @put
  op updateEvent(@path gid:string, @path id: string, @body event: EventUpdateRequest):
  | Utils.Response.OKResponse<Event>
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * イベント情報の削除
   */
  @route("events/{id}")
  @summary("イベント情報の削除")
  @delete
  op deleteEvent(@path gid: string, @path id:string):
  | Utils.Response.OKMessage
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;
}

model Event {
  /**
   * イベントID
   */
  id: string;

  /**
   * イベント名
   */
  name: string;

  /**
   * イベントの日付
   */
  evented_at: utcDateTime;

  /**
   * イベント作成者のユーザー情報
   */
  created_by: User;

  /**
   * イベントの紐づいたグループID
   */
  group_id: string;
}

model EventsResponse {
  events: Event[];
}

model EventCreateRequest {
  /**
   * イベント名
   */
  name: string;

  /**
   * イベントの日付
   */
  evented_at: utcDateTime;
}

model EventUpdateRequest {
  /**
   * イベント名
   */
  name: string;

  /**
   * イベントの日付
   */
  evented_at: utcDateTime;
}
