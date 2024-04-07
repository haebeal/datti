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
  | Event
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * グループIDに紐づくイベント情報の取得
   */
  @route("events")
  @summary("グループIDに紐づくイベント情報の取得")
  @get
  op getEventsByGid(@path gid: string):
  | EventList
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * イベント情報の登録
   */
  @route("events")
  @summary("イベント情報の登録")
  @post
  op createEvent(@path gid: string, @body event: EventCreate):
  | Event
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * イベント情報の更新
   */
  @route("events/{id}")
  @summary("イベント情報の更新")
  @put
  op updateEvent(@path gid:string, @path id: string, @body event: EventUpdate):
  | Event
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

model EventList {
  events: {
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
    created_by: string;

    /**
     * イベントの紐づいたグループID
     */
    group_id: string;
  }[];
}

model EventCreate {
  /**
   * イベント名
   */
  name: string;

  /**
   * イベントの日付
   */
  evented_at: utcDateTime;
}

model EventUpdate {
  /**
   * イベント名
   */
  name: string;

  /**
   * イベントの日付
   */
  evented_at: utcDateTime;
}