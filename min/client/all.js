!function(a){a.states=a.states||{},a.states.game=function(b,c,d){var e=null,f=a.me,g=null,h=null,i=null,j=null,k=null,l=b.game,m=(b.players,{x:0,y:0,down:!1,ox:null,oy:null}),n={x:0,y:0,w:0,h:0};return moves={},toggleHp=!0,shipLocations={},animationLength=500*l.turnTime,{onActivate:function(){this.resetShips(),this.resetCounter();var a=this;$("#wrapper").html($.template($("#gameTemplate").html(),{})),g=$("#gameCanvas"),h=g.get(),i=g.context(),h.tabIndex=0,h.focus(),n.w=h.width=innerWidth,n.h=h.height=innerHeight,$(window).on("resize",function(){n.w=h.width=innerWidth,n.h=h.height=innerHeight}),g.on("keydown",function(b){a.onKeyDown(b)}),g.on("mousedown",function(b){a.onClick(b)}),g.on("mouseup",function(){m.down=!1}),g.on("mouseleave",function(){m.down=!1}),$(window).on("mouseleave",function(){m.down=!1}),g.on("mousemove",function(a){m.px=m.x,m.py=m.y,m.x=a.clientX,m.y=a.clientY,m.down&&(n.x+=m.px-m.x,n.y+=m.py-m.y)}),d.on("turnComplete",function(b){a.turnComplete(b)}),d.on("g/disconnect",function(a){alert(a.msg),a.quit&&(c.pop(),c.pop())}),a.redraw(l)},onDeactivate:function(){$("#wrapper").html(""),d.removeAllListeners("refreshUsersList")},onDestroy:function(){},onPause:function(){},onUpdate:function(a,c){var f,g=l.turnTime,h=this;e&&(g=Math.floor((e-new Date)/1e3),g=0>g?0:g,$("#gameCounter").html(g),f=h.findShip(m.x+n.x,m.y+n.y),k=f?f.id:null,h.animateShips(c/animationLength)),b.host&&0>=g&&d.emit("turnNext",{gameId:l.id,host:b.host}),h.redraw(l)},animateShips:function(a){$.each(l.ships,function(b){if(b.state>=0){var c=shipLocations[b.id];c&&(c.t=Math.min(c.t+a,1),c.x=$.lerp(c.x,b.x,c.t),c.y=$.lerp(c.y,b.y,c.t))}})},turnComplete:function(a){l.ships=a.ships,this.resetCounter(),this.resetShips()},resetShips:function(){$.each(l.ships,function(a){var b;b=moves[a.id],b&&b.x==a.x&&b.y==a.y&&(moves[a.id]=null),shipLocations[a.id]={x:a.px||a.x,y:a.py||a.y,t:0}})},redraw:function(b){var c=this,d=a.states.g;i.save(),i.translate(-n.x,-n.y),i.clearRect(n.x,n.y,n.w,n.h),d.bg.render(i,n),$.each(b.ships,function(a){var b=a.id==j||a.id==k,c=shipLocations[a.id];(toggleHp||b)&&d.ship.renderHp(i,a,c,b)}),$.each(b.ships,function(a){d.ship.render(i,a,shipLocations[a.id],k,j,c.fingShipById)}),i.restore()},resetCounter:function(){e=new Date,e.setSeconds(e.getSeconds()+l.turnTime)},findShip:function(a,b){var c=null;return $.each(l.ships,function(d){var e=d.w/2,f=e,g=shipLocations[d.id]||d;g.x-e<=a&&g.x+e>=a&&g.y-f<=b&&g.y+f>=b&&(c=d)}),c},fingShipById:function(a){var b=null;return $.each(l.ships,function(c){c.id==a&&(b=c)}),b},onClick:function(a){var c,e=a.pageX+n.x,g=a.pageY+n.y,h=this.findShip(e,g);m.down=!0,h?j==h.id?j=null:h.player==f.id&&(j=h.id):j?(c={id:b.game.id,playerId:f.id,shipId:j,x:e,y:g},moves[j]=c,d.emit("g/move",c)):j=null},onKeyDown:function(a){var b=a.keyCode;switch(b){case 27:j=null;break;case 32:toggleHp=!toggleHp;break;case 37:n.x+=3;break;case 38:n.y+=3;break;case 39:n.x-=3;break;case 40:n.y-=3}}}}}(window),function(a){a.states=a.states||{},a.states.gameList=function(b,c,d){var e=a.me;return{onActivate:function(){var a=this;$("#wrapper").html($.template($("#gameListTemplate").html(),{})),$("#headerWrapper").html($.template($("#templateWelcome").html(),e)),d.on("refreshGames",function(b){a.refreshGames(b)}),$("#createGameBtn").on("click",function(){$("#createGameBtn").attr("disabled","disabled"),d.emit("createGame",{},a.gameCreated)}),$("#refreshGamesBtn").on("click",function(){d.emit("requestGames",{},function(b){a.refreshGames(b)})})},onDeactivate:function(){$("#wrapper").html(""),d.removeAllListeners("refreshGames")},onDestroy:function(){},onPause:function(){},onUpdate:function(){},gameCreated:function(a){a.success?c.push("gameLobby",{game:a.game,players:a.players,host:!0}):(alert("Unable to create game."),$("#createGameBtn").attr("disabled",""))},gameJoined:function(a){a.success?c.push("gameLobby",{game:a.game,players:a.players,host:!1}):alert("Unable to join the game.")},refreshGames:function(a){for(var b="",c=0,e=this;c<a.length;c++)b+=$.template($("#templateGamesListItem").html(),{id:a[c].id,host:a[c].host.name,count:a[c].count});$("#gamesList").html(b),$(".game-item").on("click",function(){d.emit("joinGame",{gameId:this.getAttribute("data-id")},e.gameJoined)}),0==a.length?($("#noGamesAvailable").attr("style","display:block"),$("#gamesListTable").attr("style","display:none")):($("#noGamesAvailable").attr("style","display:none"),$("#gamesListTable").attr("style","display:block"))}}}}(window),function(a){a.states=a.states||{},a.states.gameLobby=function(a,b,c){var d=a.game,e=a.players,f=1e3,g=1e3,h=100,i=100,j=200,k={bs:2,cv:4,ft:2};return{onActivate:function(){var f=this;$("#wrapper").html($.template($("#gameLobbyTemplate").html(),{})),$("#maxCost").html(g),this.refreshUserList(e),a.host?$("#startGameBtn").html("Start Game").on("click",this.startGame):$("#startGameBtn").html("Ready").on("click",this.setReady),$("#leaveGameBtn").on("click",function(){c.emit("g/leave",{gameId:d.id}),b.pop()}),$("#bsQty").on("change",function(){f.shipQuantities()}),$("#cvQty").on("change",function(){f.shipQuantities()}),$("#ftQty").on("change",function(){f.shipQuantities()}),c.on("refreshUsersList",function(a){e=a,f.refreshUserList(a)}),c.on("gameStarted",function(c){b.push("game",{game:c.game,players:e,host:a.host})}),c.on("g/readied",function(a){d.ready=a.ready,f.refreshUserList(e)}),c.on("g/disconnect",function(a){a.msg&&alert(a.msg),a.quit?b.pop():(d=a.game,a.players&&(e=a.players,f.refreshUserList(e)))})},onDeactivate:function(){$("#wrapper").html(""),c.removeAllListeners("g/readied"),c.removeAllListeners("g/disconnect"),c.removeAllListeners("refreshUsersList"),c.removeAllListeners("gameStarted")},onDestroy:function(){},onPause:function(){},onUpdate:function(){},refreshUserList:function(a){var b="";a.forEach(function(a){b+=$.template($("#templateUsersListItem").html(),{color:a.color,name:a.name,ready:d.ready.indexOf(a.id)>=0?"(Ready)":""})}),$("#usersList").html(b)},shipQuantities:function(){var a=parseInt($("#bsQty").value()),b=parseInt($("#cvQty").value()),c=parseInt($("#ftQty").value());isNaN(a)&&alert("Invalid battleship quantity."),isNaN(b)&&alert("Invalid corvette quantity."),isNaN(c)&&alert("Invalid fighter quantity."),k.bs=a,k.cv=b,k.ft=c,$("#bsTotal").html(a*j),$("#cvTotal").html(b*i),$("#ftTotal").html(c*h),f=a*j+b*i+c*h},startGame:function(){f>g?alert("Your total cost is "+f+" and the limit for this game is "+g+". Please reconfigure your fleet."):2!=e.length?alert("Must have two players in game."):e.length!=d.ready.length?alert("All players must be ready."):a.host?($("#startGameBtn").attr("disabled","disabled"),$("#bsQty").attr("disabled","disabled"),$("#cvQty").attr("disabled","disabled"),$("#ftQty").attr("disabled","disabled"),c.emit("startGame",{gameId:d.id,fleet:k},function(){alert("Unable to start the game."),$("#startGameBtn").attr("disabled",""),$("#bsQty").attr("disabled",""),$("#cvQty").attr("disabled",""),$("#ftQty").attr("disabled","")})):alert("Only host can start game.")},setReady:function(){f>g?alert("Your total cost is "+f+" and the limit for this game is "+g+". Please reconfigure your fleet."):($("#startGameBtn").attr("disabled","disabled"),$("#bsQty").attr("disabled","disabled"),$("#cvQty").attr("disabled","disabled"),$("#ftQty").attr("disabled","disabled"),c.emit("g/ready",{id:d.id,ready:!0,fleet:k},function(a){a.success||(alert("Unable to set ready status."),$("#startGameBtn").attr("disabled",""),$("#bsQty").attr("disabled",""),$("#cvQty").attr("disabled",""),$("#ftQty").attr("disabled",""))}))}}}}(window),function(a,b){var c=function(a){var d=null;return"string"==typeof a?d="#"==a[0]?[b.getElementById(a.substring(1))]:b.getElementsByClassName(a.substring(1)):a&&(d=[a]),{on:function(a,b){return c.each(d,function(c){c.addEventListener?c.addEventListener(a,b,!1):c.attachEvent("on"+a,b)}),this},attr:function(a,b){return void 0==b?d.length>0?d[0].getAttribute(a):"":(c.each(d,function(c){c.setAttribute(a,b)}),this)},html:function(a){return void 0==a?d.length>0?d[0].innerHTML:"":(c.each(d,function(b){b.innerHTML=a}),this)},value:function(a){return void 0==a?d.length>0?d[0].value:"":(c.each(d,function(b){b.value=a}),this)},context:function(){return d.length>0?d[0].getContext("2d"):null},get:function(){return d.length>0?d[0]:null}}};c.template=function(a,b){return a.replace(/\{\{(\w*)\}\}/g,function(a,c){return b.hasOwnProperty(c)?b[c]:""})},c.each=function(a,b){for(var c=0;c<a.length;c++)b(a[c],c)},c.rand=function(a){return Math.random()*a},c.randI=function(a){return Math.floor(c.rand(a)-.5)},c.lerp=function(a,b,c){return a+(b-a)*c},a.$=c}(window,document),function(a){var b=function(a,b){var c=[],d=!1;return{current:function(){return c.length>0?c[c.length-1]:{}},pause:function(a){d=a,$.each(c,function(b){b.onPause(a)})},pop:function(){var a=null;return c.length>0&&(a=c.pop(),a.onDestroy()),c.length>0&&c[c.length-1].onActivate(),a},push:function(d,e){c.length>0&&c[c.length-1].onDeactivate();var f=a(d,e,this,b);c.push(f),f.onActivate()},swap:function(a){var b=this.pop();return this.push(a),b},update:function(a){$.each(c,function(b,d){b.onUpdate(d==c.length-1,a)})}}};a.gameStates=b}(window,$),function(a){a.stateFactory=function(b,c,d,e){switch(b){case"gameList":return a.states.gameList(c,d,e);case"gameLobby":return a.states.gameLobby(c,d,e);case"game":return a.states.game(c,d,e)}}}(window);