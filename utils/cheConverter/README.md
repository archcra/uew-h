


# 关于本工具

本工具只是一个对于天天象棋存储文件转换的示例，仅供参考。
本工具实际应用于Enduro CMS的棋谱批量更新。具体网页请参见：http://youshiyou.de/boards-list/

本工具的工作原理，就是将天天象棋的棋谱文件，转换为一个个CMS应用所需要的.js文件。js文件示例如下：

```
将.che文件转换为 cms/cboard/foo.js 文件


board_title: '',
board_time: '',
board_site: '',
board_red: '',
board_black: '',
board_comment: '',
board_content: ''
}
```

上面主要是对弈的主要信息，如红方、黑方等。最重要的，就是board_content，这个是东萍格式的数据，使用东萍插件显示棋谱，可在线打谱。

东萍的存储格式非常简单。棋谱局面和行棋着法均采用坐标纪录，棋盘左上角为(0,0)，右下角为(8,9)，比如“炮二平五”，纪录为“7747”，是最简单的程序纪录格式。

# 其他
对于关心天天象棋存储格式的朋友，可参见“天天象棋存盘格式.md”文件，对收藏的棋谱文件存储格式做进一步了解。

文件“棋谱更新.md”是原CMS系统更新棋谱的文档部份内容，仅供参考。

# 参考
东萍格式说明：http://www.dpxq.com/hldcg/dhtmlxq/DhtmlXQ_show.htm （DhtmlXQ动态棋盘简介）
