import { NgModule } from '@angular/core'
import { VideoSupportComponent } from '@app/videos/+video-watch/modal/video-support.component'
import { SharedModule } from '../../shared'
import { VideoCommentAddComponent } from './comment/video-comment-add.component'
import { VideoCommentComponent } from './comment/video-comment.component'
import { VideoCommentService } from './comment/video-comment.service'
import { VideoCommentsComponent } from './comment/video-comments.component'
import { VideoShareComponent } from './modal/video-share.component'
import { VideoWatchRoutingModule } from './video-watch-routing.module'
import { VideoWatchComponent } from './video-watch.component'
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap'
import { RecommendationsModule } from '@app/videos/recommendations/recommendations.module'
import { VideoWatchPlaylistComponent } from '@app/videos/+video-watch/video-watch-playlist.component'
import { QRCodeModule } from 'angularx-qrcode'
import { InputSwitchModule } from 'primeng/inputswitch'

@NgModule({
  imports: [
    VideoWatchRoutingModule,
    SharedModule,
    NgbTooltipModule,
    QRCodeModule,
    RecommendationsModule,
    InputSwitchModule
  ],

  declarations: [
    VideoWatchComponent,
    VideoWatchPlaylistComponent,

    VideoShareComponent,
    VideoSupportComponent,
    VideoCommentsComponent,
    VideoCommentAddComponent,
    VideoCommentComponent
  ],

  exports: [
    VideoWatchComponent
  ],

  providers: [
    VideoCommentService
  ]
})
export class VideoWatchModule { }
