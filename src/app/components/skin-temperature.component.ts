﻿import {Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy, ChangeDetectorRef} from "@angular/core";
import { Observable as RxObservable, Subscription, BehaviorSubject } from "rxjs/Rx";
import "rxjs/add/operator/map";
import 'rxjs/add/operator/do';
import {NgZone} from "@angular/core";

// app
import {MicrosoftBandService} from '@xmlking/nativescript-ngx-microsoftband';
import {View} from "ui/core/view";


@Component({
    selector: 'skin-temperature',
    template: `
      <StackLayout class="blue" [row]="row" [col]="col" (tap)="toggle(iconLabel)" >
        <Label row="1" [text]="errorMsg" horizontalAlignment="center" class="text-muted" textWrap="true"></Label>
        <Label row="2" text="\uf2c8" horizontalAlignment="center" class="fa h2" #iconLabel></Label>
        <Label row="3" [text]="sensorData?.temperature" horizontalAlignment="center" class="font-weight-normal"></Label>
      </StackLayout>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkinTemperatureComponent implements OnInit, OnDestroy {
    @Input() connected: boolean;
    @Input() row: number;
    @Input() col: number;

    private sensorSub: Subscription;
    public sensorData: SkinTemperatureData;
    public errorMsg: string;
    public started: boolean = false;

    constructor(private zone: NgZone, private cd: ChangeDetectorRef, private msband: MicrosoftBandService) {

    }

    ngOnInit() {
        this.startSensorUpdates()

    };

    ngOnDestroy() {
        this.stopSensorUpdates();
    }

    public toggle(target: View) {
        if(this.started) {
            this.stopSensorUpdates();
            target.animate({rotate: 180, duration: 500})
        } else {
            this.startSensorUpdates();
            target.animate({rotate: 360, duration: 500})
        }
    }


    private startSensorUpdates() {
        this.msband.requestUserConsent((isGranted) => {
            if (isGranted) {
                this.sensorSub = this.msband.skinTemperature$.subscribe(
                    (data: SkinTemperatureData) => {
                        this.zone.run(() => {
                            this.sensorData = data;
                            this.cd.markForCheck();
                        });
                    },
                    (error: NSError) => {
                        this.zone.run(() => {
                            this.errorMsg = error.localizedDescription;
                            this.cd.markForCheck();
                        });
                    }
                );

            }
            this.started = true;
        })
    }

    private stopSensorUpdates() {
        if(this.sensorSub) {
            this.sensorSub.unsubscribe();
        }
        this.started = false;
    }

}
