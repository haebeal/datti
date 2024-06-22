import "../utils";

using TypeSpec.Http;
using Utils;

namespace DattiAPI;
/**
 * イベント情報に関する操作
 */
@tag("Events")
@route("groups/{groupId}")
namespace EventEndpoints {
  /**
   * 登録されているイベント情報の取得
   */
  @route("events/{eventId}")
  @summary("イベントIDに紐づくイベント情報の取得")
  @get
  op getEvent(@path groupId: string, @path eventId: string):
  | EventResponse
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * グループIDに紐づくイベント情報の取得
   */
  @route("events")
  @summary("グループIDに紐づくイベント情報の取得")
  @get
  op getEventsByGid(@path groupId: string):
  | EventsResponse
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * イベント情報の登録
   */
  @route("events")
  @summary("イベント情報の登録")
  @post
  op createEvent(@path groupId: string, @body event: EventPostRequest):
  | EventResponse
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * イベント情報の更新
   */
  @route("events/{eventId}")
  @summary("イベント情報の更新")
  @put
  op updateEvent(@path groupId: string, @path eventId: string, @body event: EventPutRequest):
  | EventResponse
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * イベント情報の削除
   */
  @route("events/{eventId}")
  @summary("イベント情報の削除")
  @delete
  op deleteEvent(@path groupId: string, @path eventId:string):
  | Utils.Response.OKMessage
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  model EventPostRequest {
    /**
     * イベント名
     */
    name: string;

    /**
     * イベントの日付
     */
    evented_at: utcDateTime;

    /**
     * 立て替えたユーザー
     */
    paid_by: string;

    /**
     * 立て替えた金額
     */
    amount: integer;

    /**
     * 立て替えてもらったユーザー
     */
    payments: {
      paid_to: string;
      amount: integer;
    }[];
  }

  model EventPutRequest {
    /**
     * イベント名
     */
    name: string;

    /**
     * イベントの日付
     */
    evented_at: utcDateTime;

    /**
     * 立て替えたユーザー
     */
    paid_by: string;

    /**
     * 立て替えた金額
     */
    amount: integer;

    /**
     * 立て替えてもらったユーザー
     */
    payments: {
      payment_id?: string;
      paid_to:string;
      amount: integer;
    }[];
  }

  model EventResponse {
    id: string;
    name: string;
    evented_at: utcDateTime;
    created_by: string;
    paid_by: string;
    amount:integer;
    paymetns: {
      payment_id: string;
      paid_to: string;
      amount: string;
    }[];
    group_id: string;
  }

  model EventsResponse {
    events: {
      id: string;
      name: string;
      evented_at: utcDateTime;
      paid_by: {
        id: string;
        name: string;
      };
      amount: integer;
    }[];
  }
}
model Event {

}
