import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { AuthService } from 'src/auth/service/auth.service';
import { UserService } from 'src/user/service/user.service';
import { RoomService } from '../service/room-service/room.service';
import { ConnectedUserService } from '../service/connected-user/connected-user.service';
import { JoinedRoomService } from '../service/joined-room/joined-room.service';
import { MessageService } from '../service/message/message.service';
import { UserInformation } from 'src/user/model/user.interface';
import { RoomInformation } from '../model/room/room.dto';
import { ConnectedUserInformation } from '../model/connected-user/connected-user.interface';
import { PageInformation } from '../model/page.interface';
import { MessageInformation } from '../model/message/message.interface';
import { JoinedRoomInformation } from '../model/joined-room/joined-room.interface';
import { ApiTags } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { AsyncApiPub } from 'nestjs-asyncapi/dist/lib/decorators';
import { CreateUserDto } from 'src/user/model/dto/create-user.dto';
import { Routes } from './routes.enums';
import { PageInfo } from './pageInfo.dto';
import { MessageInfo } from './messageInfo.dto';
import { Empty } from './empty.dto';

@WebSocketGateway({
  namespace: 'chat',
})
@ApiTags('gateway')
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  // io: Namespace;
  server: Server;
  private logger: Logger = new Logger('AppGateway');

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private roomService: RoomService,
    private connectedUserService: ConnectedUserService,
    private joinedRoomService: JoinedRoomService,
    private messageService: MessageService,
  ) {}

  async onModuleInit() {
    await this.connectedUserService.deleteAll();
    await this.joinedRoomService.deleteAll();
  }
  async handleConnection(socket: Socket) {
    try {
      const token = await this.authService.verifyJwt(
        socket.handshake.headers.authorization,
      );
      const user: UserInformation = await this.userService.getOne(
        token.user.id,
      );
      if (!user) {
        return this.disconnect(socket);
      } else {
        socket.data.user = user;

        this.logger.log(`user connected ${socket.id}`);
        const rooms = await this.roomService.getRoomsForUser(user.id, {
          page: 1,
          limit: 10,
        });
        // save connection to database
        await this.connectedUserService.create({ socketId: socket.id, user });
        console.log(`WS client with id:${socket.id} connected`);

        // only emit rooms to specific connected users
        return this.server.to(socket.id).emit('rooms', rooms);
      }
    } catch {
      return this.disconnect(socket);
    }
  }
  async handleDisconnect(socket: Socket) {
    // remove the connection from databae
    await this.connectedUserService.deleteBySocketId(socket.id);
    socket.disconnect();
  }
  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }
  @AsyncApiPub({
    channel: Routes.CREATEROOM,
    message: {
      payload: RoomInformation,
    },
  })
  @SubscribeMessage(Routes.CREATEROOM)
  async onCreateRoom(socket: Socket, room: RoomInformation) {
    const createdRoom: RoomInformation = await this.roomService.createRoom(
      room,
      socket.data.user,
    );
    for (const user of createdRoom.users) {
      const connections: ConnectedUserInformation[] =
        await this.connectedUserService.findByUser(user);
      const rooms = await this.roomService.getRoomsForUser(user.id, {
        page: 1,
        limit: 10,
      });
      for (const connection of connections) {
        await this.server.to(connection.socketId).emit('rooms', rooms);
      }
    }
  }

  @AsyncApiPub({
    channel: Routes.PAGINATEROOMS,
    message: {
      payload: PageInfo,
    },
  })
  @SubscribeMessage(Routes.PAGINATEROOMS)
  async onPaginateRoom(socket: Socket, page: PageInformation) {
    const rooms = await this.roomService.getRoomsForUser(
      socket.data.user.id,
      this.handleIncomingPageRequest(page),
    );
    return this.server.to(socket.id).emit('rooms', rooms);
  }

  @AsyncApiPub({
    channel: Routes.JOINROOM,
    message: {
      payload: RoomInformation,
    },
  })
  @SubscribeMessage(Routes.JOINROOM)
  async onJoinRoom(socket: Socket, room: RoomInformation) {
    const messages = await this.messageService.findMessagesForRoom(room, {
      limit: 10,
      page: 1,
    });
    // saving connection to room
    await this.joinedRoomService.create({
      socketId: socket.id,
      user: socket.data.user,
      room,
    });
    //sending last messages from room to user
    await this.server.to(socket.id).emit('messages', messages);
  }

  @AsyncApiPub({
    channel: Routes.LEAVEROOM,
    message: {
      payload: Empty,
    },
  })
  @SubscribeMessage(Routes.LEAVEROOM)
  async onLeaveRoom(socket: Socket) {
    // remove connectin from joined rooms
    await this.joinedRoomService.deleteBySocketId(socket.id);
  }

  @AsyncApiPub({
    channel: Routes.ADDMESSAGE,
    message: {
      payload: MessageInfo,
    },
  })
  @SubscribeMessage(Routes.ADDMESSAGE)
  async onAddMessage(socket: Socket, message: MessageInformation) {
    const createdMessage: MessageInformation = await this.messageService.create(
      { ...message, user: socket.data.user },
    );
    const room: RoomInformation = await this.roomService.getRoom(
      createdMessage.room.id,
    );
    const joinedUsers: JoinedRoomInformation[] =
      await this.joinedRoomService.findByRoom(room);

    for (const user of joinedUsers) {
      await this.server.to(user.socketId).emit('messageAdded', createdMessage);
    }
  }
  private handleIncomingPageRequest(page: PageInformation) {
    page.limit = page.limit > 50 ? 50 : page.limit;
    return page;
  }
}
