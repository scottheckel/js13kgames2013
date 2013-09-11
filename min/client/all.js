!function(a){a.states=a.states||{},a.states.game=function(b,c,d){var e=null,f=a.me,g=null,h=null,i=null,j=null,k=null,l=b.game,m=(b.players,{x:0,y:0}),n={x:0,y:0,w:0,h:0};return moves={},toggleHp=!0,{onActivate:function(){this.resetCounter();var a=this;$("#wrapper").html($.template($("#gameTemplate").html(),{})),g=$("#gameCanvas"),h=g.get(),i=g.context(),h.tabIndex=0,h.focus(),n.w=h.width=innerWidth,n.h=h.height=innerHeight,g.on("keydown",function(b){a.onKeyDown(b)}),g.on("click",function(c){var e,g=c.pageX+n.x,h=c.pageY+n.y,i=a.findShip(g,h);i?j==i.id?j=null:i.player==f.id&&(j=i.id):j?(e={id:b.game.id,playerId:f.id,shipId:j,x:g,y:h},moves[j]=e,d.emit("g/move",e)):j=null}),g.on("mousemove",function(a){m.x=a.clientX,m.y=a.clientY}),d.on("turnComplete",function(b){a.turnComplete(b)}),a.redraw(l)},onDeactivate:function(){$("#wrapper").html(""),d.removeAllListeners("refreshUsersList")},onDestroy:function(){},onPause:function(){},onUpdate:function(){var a,c=l.turnTime,f=this;e&&(c=Math.floor((e-new Date)/1e3),c=0>c?0:c,$("#gameCounter").html(c+" remaining"),a=f.findShip(m.x+n.x,m.y+n.y),k=a?a.id:null),b.host&&0>=c&&d.emit("turnNext",{gameId:l.id,host:b.host}),f.redraw(l)},turnComplete:function(a){l.ships=a.ships,this.resetCounter(),this.resetMoves()},resetMoves:function(){var a;$.each(l.ships,function(b){a=moves[b.id],a&&a.x==b.x&&a.y==b.y&&(moves[b.id]=null)})},redraw:function(b){var c=this,d=a.states.g;i.save(),i.translate(-n.x,-n.y),i.clearRect(n.x,n.y,n.w,n.h),d.bg.render(i,n),$.each(b.ships,function(a){var b=a.id==j||a.id==k;(toggleHp||b)&&d.ship.renderHp(i,a,b)}),i.strokeStyle="#ffff00",i.beginPath(),i.arc(n.x+m.x,n.y+m.y,5,0,2*Math.PI,!0),i.stroke(),$.each(b.ships,function(a){c.drawShip(a)}),i.restore()},drawShip:function(a){var b,c;a.state>0&&(i.fillStyle="#000000",i.fillText("HP:"+a.hp,a.x,a.y-a.w),i.strokeStyle=a.id==j?"#ff0000":a.id==k?"#ffff00":a.color,i.beginPath(),i.arc(a.x,a.y,a.w/2,0,2*Math.PI,!0),i.stroke(),null!=a.px&&null!=a.py&&(i.strokeStyle="#c0c0c0",i.beginPath(),i.moveTo(a.px,a.py),i.lineTo(a.x,a.y),i.stroke()),b=moves[a.id],b&&(i.strokeStyle="#ffffff",i.beginPath(),i.moveTo(a.x,a.y),i.lineTo(b.x,b.y),i.stroke()),a.target&&(c=this.fingShipById(a.target),c&&(i.strokeStyle=a.color,i.beginPath(),i.moveTo(a.x,a.y),i.lineTo(c.x,c.y),i.stroke())))},resetCounter:function(){e=new Date,e.setSeconds(e.getSeconds()+l.turnTime)},findShip:function(a,b){var c=null;return $.each(l.ships,function(d){var e=d.w/2,f=e;d.x-e<=a&&d.x+e>=a&&d.y-f<=b&&d.y+f>=b&&(c=d)}),c},fingShipById:function(a){var b=null;return $.each(l.ships,function(c){c.id==a&&(b=c)}),b},onKeyDown:function(a){var b=a.keyCode;switch(b){case 27:j=null;break;case 32:toggleHp=!toggleHp;break;case 37:n.x+=3;break;case 38:n.y+=3;break;case 39:n.x-=3;break;case 40:n.y-=3}}}}}(window),function(a){a.states=a.states||{},a.states.gameList=function(b,c,d){var e=a.me;return{onActivate:function(){var a=this;$("#wrapper").html($.template($("#gameListTemplate").html(),{})),$("#headerWrapper").html($.template($("#templateWelcome").html(),e)),d.on("refreshGames",function(b){a.refreshGames(b)}),$("#createGameBtn").on("click",function(){d.emit("createGame",{user:e},a.gameCreated)}),$("#refreshGamesBtn").on("click",function(){d.emit("requestGames",{},function(b){a.refreshGames(b)})})},onDeactivate:function(){$("#wrapper").html(""),d.removeAllListeners("refreshGames")},onDestroy:function(){},onPause:function(){},onUpdate:function(){},gameCreated:function(a){a.success?c.push("gameLobby",{game:a.game,players:a.players,host:!0}):alert("unable to create game")},gameJoined:function(a){a.success?c.push("gameLobby",{game:a.game,players:a.players,host:!1}):alert("Unable to join the game.")},refreshGames:function(a){for(var b="",c=0,f=this;c<a.length;c++)b+=$.template($("#templateGamesListItem").html(),{id:a[c].id,host:a[c].host.id,count:a[c].count});$("#gamesList").html(b),$(".game-item").on("click",function(){d.emit("joinGame",{gameId:this.getAttribute("data-id"),user:e},f.gameJoined)})}}}}(window),function(a){a.states=a.states||{},a.states.gameLobby=function(a,b,c){var d=a.game,e=a.players;return{onActivate:function(){var d=this;$("#wrapper").html($.template($("#gameLobbyTemplate").html(),{})),this.refreshUserList(e),a.host?$("#startGameBtn").attr("style","display:block").on("click",this.startGame):$("#startGameBtn").attr("style","display:none"),c.on("refreshUsersList",function(a){e=a,d.refreshUserList(a)}),c.on("gameStarted",function(c){b.push("game",{game:c.game,players:e,host:a.host})})},onDeactivate:function(){$("#wrapper").html(""),c.removeAllListeners("refreshUsersList"),c.removeAllListeners("gameStarted")},onDestroy:function(){},onPause:function(){},onUpdate:function(){},refreshUserList:function(a){var b="";a.forEach(function(a){b+=$.template(templateUsersListItem.innerHTML,a)}),$("#usersList").html(b)},startGame:function(){2!=e.length?alert("Must have two players in game."):a.host?($("#startGameBtn").attr("disabled","disabled"),c.emit("startGame",{gameId:d.id},function(a){a.success?b.push("game",a.game):(alert("Unable to start the game."),$("#startGameBtn").attr("disabled",""))})):alert("Only host can start game.")}}}}(window),function(a,b){var c=function(a){var d=null;return"string"==typeof a?d="#"==a[0]?[b.getElementById(a.substring(1))]:b.getElementsByClassName(a.substring(1)):a&&(d=[a]),{on:function(a,b){return c.each(d,function(c){c.addEventListener?c.addEventListener(a,b,!1):c.attachEvent("on"+a,b)}),this},attr:function(a,b){return void 0==b?d.length>0?d[0].getAttribute(a):"":(c.each(d,function(c){c.setAttribute(a,b)}),this)},html:function(a){return void 0==a?d.length>0?d[0].innerHTML:"":(c.each(d,function(b){b.innerHTML=a}),this)},context:function(){return d.length>0?d[0].getContext("2d"):null},get:function(){return d.length>0?d[0]:null}}};c.template=function(a,b){return a.replace(/\{\{(\w*)\}\}/g,function(a,c){return b.hasOwnProperty(c)?b[c]:""})},c.each=function(a,b){for(var c=0;c<a.length;c++)b(a[c],c)},c.rand=function(a){return Math.random()*a},c.randI=function(a){return Math.floor(c.rand(a)-.5)},a.$=c}(window,document),function(a){var b=function(a,b){var c=[],d=!1;return{current:function(){return c.length>0?c[c.length-1]:{}},pause:function(a){d=a,$.each(c,function(b){b.onPause(a)})},pop:function(){var a=null;return c.length>0&&(a=c.pop(),a.onDestroy()),c.length>0&&c[c.length-1].onActivate(),a},push:function(d,e){c.length>0&&c[c.length-1].onDeactivate();var f=a(d,e,this,b);c.push(f),f.onActivate()},swap:function(a){var b=this.pop();return this.push(a),b},update:function(){$.each(c,function(a,b){a.onUpdate(b==c.length-1)})}}};a.gameStates=b}(window,$),function(a){a.stateFactory=function(b,c,d,e){switch(b){case"gameList":return a.states.gameList(c,d,e);case"gameLobby":return a.states.gameLobby(c,d,e);case"game":return a.states.game(c,d,e)}}}(window);