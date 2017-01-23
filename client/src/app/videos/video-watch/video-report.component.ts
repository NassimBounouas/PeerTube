import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ModalDirective } from 'ng2-bootstrap/modal';

import { FormReactive, VideoAbuseService, VIDEO_ABUSE_REASON } from '../../shared';
import { Video, VideoService } from '../shared';

@Component({
  selector: 'my-video-report',
  templateUrl: './video-report.component.html'
})
export class VideoReportComponent extends FormReactive implements OnInit {
  @Input() video: Video = null;

  @ViewChild('modal') modal: ModalDirective;

  error: string = null;
  form: FormGroup;
  formErrors = {
    reason: ''
  };
  validationMessages = {
    reason: VIDEO_ABUSE_REASON.MESSAGES
  };

  constructor(
    private formBuilder: FormBuilder,
    private videoAbuseService: VideoAbuseService
   ) {
    super();
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      reason: [ '', VIDEO_ABUSE_REASON.VALIDATORS ]
    });

    this.form.valueChanges.subscribe(data => this.onValueChanged(data));
  }

  show() {
    this.modal.show();
  }

  hide() {
    this.modal.hide();
  }

  report() {
    const reason = this.form.value['reason']

    this.videoAbuseService.reportVideo(this.video.id, reason)
                     .subscribe(
                       // TODO: move alert to beautiful notifications
                       ok => {
                         alert('Video reported.');
                         this.hide();
                       },

                       err => alert(err.text)
                      )
  }
}
