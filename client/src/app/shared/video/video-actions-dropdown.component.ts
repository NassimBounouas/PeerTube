import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core'
import { I18n } from '@ngx-translate/i18n-polyfill'
import { DropdownAction, DropdownButtonSize, DropdownDirection } from '@app/shared/buttons/action-dropdown.component'
import { AuthService, ConfirmService, Notifier, ServerService } from '@app/core'
import { BlocklistService } from '@app/shared/blocklist'
import { Video } from '@app/shared/video/video.model'
import { VideoService } from '@app/shared/video/video.service'
import { VideoDetails } from '@app/shared/video/video-details.model'
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap'
import { VideoAddToPlaylistComponent } from '@app/shared/video-playlist/video-add-to-playlist.component'
import { VideoDownloadComponent } from '@app/shared/video/modals/video-download.component'
import { VideoReportComponent } from '@app/shared/video/modals/video-report.component'
import { VideoBlacklistComponent } from '@app/shared/video/modals/video-blacklist.component'
import { VideoBlacklistService } from '@app/shared/video-blacklist'
import { ScreenService } from '@app/shared/misc/screen.service'

export type VideoActionsDisplayType = {
  playlist?: boolean
  download?: boolean
  update?: boolean
  blacklist?: boolean
  delete?: boolean
  report?: boolean
}

@Component({
  selector: 'my-video-actions-dropdown',
  templateUrl: './video-actions-dropdown.component.html',
  styleUrls: [ './video-actions-dropdown.component.scss' ]
})
export class VideoActionsDropdownComponent implements OnChanges {
  @ViewChild('playlistDropdown', { static: false }) playlistDropdown: NgbDropdown
  @ViewChild('playlistAdd', { static: false }) playlistAdd: VideoAddToPlaylistComponent

  @ViewChild('videoDownloadModal', { static: false }) videoDownloadModal: VideoDownloadComponent
  @ViewChild('videoReportModal', { static: false }) videoReportModal: VideoReportComponent
  @ViewChild('videoBlacklistModal', { static: false }) videoBlacklistModal: VideoBlacklistComponent

  @Input() video: Video | VideoDetails

  @Input() displayOptions: VideoActionsDisplayType = {
    playlist: false,
    download: true,
    update: true,
    blacklist: true,
    delete: true,
    report: true
  }
  @Input() placement = 'left'

  @Input() label: string

  @Input() buttonStyled = false
  @Input() buttonSize: DropdownButtonSize = 'normal'
  @Input() buttonDirection: DropdownDirection = 'vertical'

  @Output() videoRemoved = new EventEmitter()
  @Output() videoUnblacklisted = new EventEmitter()
  @Output() videoBlacklisted = new EventEmitter()
  @Output() modalOpened = new EventEmitter()

  videoActions: DropdownAction<{ video: Video }>[][] = []

  private loaded = false

  constructor (
    private authService: AuthService,
    private notifier: Notifier,
    private confirmService: ConfirmService,
    private videoBlacklistService: VideoBlacklistService,
    private serverService: ServerService,
    private screenService: ScreenService,
    private videoService: VideoService,
    private blocklistService: BlocklistService,
    private i18n: I18n
  ) { }

  get user () {
    return this.authService.getUser()
  }

  ngOnChanges () {
    if (this.loaded) {
      this.loaded = false
      this.playlistAdd.reload()
    }

    this.buildActions()
  }

  isUserLoggedIn () {
    return this.authService.isLoggedIn()
  }

  loadDropdownInformation () {
    if (!this.isUserLoggedIn() || this.loaded === true) return

    this.loaded = true

    if (this.displayOptions.playlist) this.playlistAdd.load()
  }

  /* Show modals */

  showDownloadModal () {
    this.modalOpened.emit()

    this.videoDownloadModal.show(this.video as VideoDetails)
  }

  showReportModal () {
    this.modalOpened.emit()

    this.videoReportModal.show()
  }

  showBlacklistModal () {
    this.modalOpened.emit()

    this.videoBlacklistModal.show()
  }

  /* Actions checker */

  isVideoUpdatable () {
    return this.video.isUpdatableBy(this.user)
  }

  isVideoRemovable () {
    return this.video.isRemovableBy(this.user)
  }

  isVideoBlacklistable () {
    return this.video.isBlackistableBy(this.user)
  }

  isVideoUnblacklistable () {
    return this.video.isUnblacklistableBy(this.user)
  }

  isVideoDownloadable () {
    return this.video && this.video instanceof VideoDetails && this.video.downloadEnabled
  }

  /* Action handlers */

  async unblacklistVideo () {
    const confirmMessage = this.i18n(
      'Do you really want to remove this video from the blacklist? It will be available again in the videos list.'
    )

    const res = await this.confirmService.confirm(confirmMessage, this.i18n('Unblacklist'))
    if (res === false) return

    this.videoBlacklistService.removeVideoFromBlacklist(this.video.id).subscribe(
      () => {
        this.notifier.success(this.i18n('Video {{name}} removed from the blacklist.', { name: this.video.name }))

        this.video.blacklisted = false
        this.video.blacklistedReason = null

        this.videoUnblacklisted.emit()
      },

      err => this.notifier.error(err.message)
    )
  }

  async removeVideo () {
    this.modalOpened.emit()

    const res = await this.confirmService.confirm(this.i18n('Do you really want to delete this video?'), this.i18n('Delete'))
    if (res === false) return

    this.videoService.removeVideo(this.video.id)
        .subscribe(
          () => {
            this.notifier.success(this.i18n('Video {{videoName}} deleted.', { videoName: this.video.name }))

            this.videoRemoved.emit()
          },

          error => this.notifier.error(error.message)
        )
  }

  onVideoBlacklisted () {
    this.videoBlacklisted.emit()
  }

  getPlaylistDropdownPlacement () {
    if (this.screenService.isInSmallView()) {
      return 'bottom-right'
    }

    return 'bottom-left bottom-right'
  }

  private buildActions () {
    this.videoActions = [
      [
        {
          label: this.i18n('Save to playlist'),
          handler: () => this.playlistDropdown.toggle(),
          isDisplayed: () => this.authService.isLoggedIn() && this.displayOptions.playlist,
          iconName: 'playlist-add'
        }
      ],
      [
        {
          label: this.i18n('Download'),
          handler: () => this.showDownloadModal(),
          isDisplayed: () => this.displayOptions.download && this.isVideoDownloadable(),
          iconName: 'download'
        },
        {
          label: this.i18n('Update'),
          linkBuilder: ({ video }) => [ '/videos/update', video.uuid ],
          iconName: 'edit',
          isDisplayed: () => this.authService.isLoggedIn() && this.displayOptions.update && this.isVideoUpdatable()
        },
        {
          label: this.i18n('Blacklist'),
          handler: () => this.showBlacklistModal(),
          iconName: 'no',
          isDisplayed: () => this.authService.isLoggedIn() && this.displayOptions.blacklist && this.isVideoBlacklistable()
        },
        {
          label: this.i18n('Unblacklist'),
          handler: () => this.unblacklistVideo(),
          iconName: 'undo',
          isDisplayed: () => this.authService.isLoggedIn() && this.displayOptions.blacklist && this.isVideoUnblacklistable()
        },
        {
          label: this.i18n('Delete'),
          handler: () => this.removeVideo(),
          isDisplayed: () => this.authService.isLoggedIn() && this.displayOptions.delete && this.isVideoRemovable(),
          iconName: 'delete'
        }
      ],
      [
        {
          label: this.i18n('Report'),
          handler: () => this.showReportModal(),
          isDisplayed: () => this.authService.isLoggedIn() && this.displayOptions.report,
          iconName: 'alert'
        }
      ]
    ]
  }
}
