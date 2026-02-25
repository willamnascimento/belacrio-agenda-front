import { Calendar } from './../../../../shared/models/calendar';
import { AfterViewInit, ChangeDetectorRef, Component, Inject, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { debounceTime, filter, switchMap } from 'rxjs/operators';
import { Equipament } from 'src/app/shared/models/equipament';
import { EquipamentSpecifications } from 'src/app/shared/models/equipamentSpecifications';
import { Person } from 'src/app/shared/models/person';
import { Specification } from 'src/app/shared/models/specification';
import { CalendarService } from 'src/app/shared/services/calendar.service';
import { EquipamentsService } from 'src/app/shared/services/equipaments.service';
import { PersonService } from 'src/app/shared/services/people.service';
import { SpecificationsService } from 'src/app/shared/services/specifications.service';
import { ClientsService } from '../../../../shared/services/clients.service';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment} from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from 'src/app/consts/my-format';
import { Consumable } from 'src/app/shared/models/consumable';
import { ConsumablesService } from 'src/app/shared/services/consumables.service';
import { PriceTableService } from 'src/app/shared/services/price-table.service';

const moment = _rollupMoment || _moment;

@Component({
    selector: 'app-calendar-dialog',
    templateUrl: 'calendar-dialog.component.html',
    styleUrls: ['./calendar-dialog.component.scss'],
    providers: [
      {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
      {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
    ],
  })
  export class CalendarDialogComponent implements AfterViewInit{
    
    form: FormGroup;
    isAddMode: boolean;
    id: string;
    arr: FormArray;
    consumableArray: [] = [];
    consumableSpecificationArray: [] = [];
    clientResult: [];
    consumables: Consumable[];
    techniqueResult: Person[];
    driverResult: Person[];
    equipamentResult: Equipament[];
    specificationResult: Specification[];
    isLoading = false;
    isLoadingEquipament = false;
    notFound = false;
    todayDate;
    inputReadonly = false;
    semCadastro = false;
    @ViewChild('selectIcon') selectIcon;
    selectedtype: any;
    isVisible: boolean = true; 
    icons: any = [
      {
        id: "0",
        icon: ""
      },
      {
        id: "1",
        icon: "arrow_forward"
      },
      {
        id: "2",
        icon: "arrow_back"
      },
      {
        id: "3",
        icon: "swap_horiz"
      }
    ];

    constructor(
      public dialogRef: MatDialogRef<CalendarDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      private calendarService: CalendarService,
      private formBuilder: FormBuilder,
      private toastr: ToastrService,
      private clientService: ClientsService,
      private equipamentService: EquipamentsService,
      private personService: PersonService,
      private specificationService: SpecificationsService,
      private priceTableService: PriceTableService,
      private consumablesService: ConsumablesService,
      private cdr: ChangeDetectorRef) {
        this.todayDate = new Date();
        this.readOnly();

    }

    ngOnInit(): void {
      this.getPeople();
      this.getEquipaments();
      this.getSpecifications();
      this.createForm();
      this.loadConsumables();
      this.loadConsumableSpecification();
      this.onChanges();
      
    }

    ngAfterViewInit(): void {
      setTimeout(() => {
        this.ajustesCSS();
      },500);
    }

    readOnly(): void{
      const data = this.data.element?.date;
      if (data === undefined){
        this.inputReadonly = false;
        return;
      }
      let ret = this.compare(data.substring(0,10),this.formatDate(this.todayDate));
      
      if (ret >= 0)
        this.inputReadonly = false;
    }

    noCadastre(): void{
      this.semCadastro = !this.semCadastro;
    }

    onChanges(){
      this.form.get('client').valueChanges.pipe(
          filter( data => {
            if (typeof data === 'string' || data instanceof String){
              if (data.trim().length <= 2){
                this.isLoading = true;
                this.notFound = false;
                this.clientResult = [];
              }
              return data.trim().length > 2
            }
          }),
          debounceTime(500),
          switchMap(  (search: string) => {
            return search ? this.clientService.getClients(true,search) : of([]);
       })
      ).subscribe(data =>{
        this.clientResult = data as [];
        if (this.clientResult.length == 0)
          this.notFound = true
        else
          this.isLoading = false;
      })
    }

    displayFn(item) {
      if (item === null)
        return;
      return item?.name;
    }

    createForm(): void {
      let list = this.data.element?.calendarSpecifications;
      let temp = JSON.parse(localStorage.getItem('specificationsList'));
      let array = [];
      let consumableArray: [] = [];
      this.id = this.data.element;
      this.isAddMode = !this.id;

      if (!this.isAddMode){
        
        list.forEach(item => {
          let calendarSpecification = {
            
            active: (this.isAddMode ? false : this.data.element?.calendarSpecifications.filter(x => x.specificationId == item.specificationId)[0].active),
            specificationId: item.specificationId,
            name: temp.find(x => x.id === item.specificationId).name
          } as EquipamentSpecifications;
          array.push(this.buildCalendarSpecifications(calendarSpecification));
        });
      }

      this.form = this.formBuilder.group({
        id:  [this.data.element?.id || ''],
        createdAt: [this.data.element?.createdAt || new Date()],
        updatedAt: [this.data.element?.updatedsAt || null],
        client: this.inputReadonly ? [{value: this.data.element?.client, disabled: true }] : [this.data.element?.client,Validators.required],
        clientId: this.inputReadonly ? [{value: this.data.element?.clientId, disabled: true}] : [{value: this.data.element?.clientId, disabled: false}],
        driverId: this.inputReadonly ? [{value: this.data.element?.driverId, disabled: true}] : [{value: this.data.element?.driverId, disabled: false}],
        driverCollectsId: this.inputReadonly ? [{value: this.data.element?.driverCollectsId, disabled: true}] : [{value: this.data.element?.driverCollectsId, disabled: false}],
        techniqueId: this.inputReadonly ? [{value: this.data.element?.techniqueId, disabled: true}] : [{value: this.data.element?.techniqueId, disabled: false}],
        active: [true],
        noCadastre: this.inputReadonly ? [{value: this.data.element?.noCadastre || false, disabled: true}] : [{value: this.data.element?.noCadastre || false, disabled: false}],
        note: this.inputReadonly ? [{value: this.data.element?.note, disabled: true}] : [this.data.element?.note],
        userId: [this.data.element?.userId],
        parentId: [this.data.element?.parentId],
        discount: this.inputReadonly ? [{value: this.data.element?.discount.toFixed(2).replace('.',',') || 0, disabled: true}] : [{value: this.data.element?.discount.toFixed(2).replace('.',',') || 0, disabled: false}],
        freight: this.inputReadonly ? [{value: this.data.element?.freight.toFixed(2).replace('.',',') || 0, disabled: true}] : [{value: this.data.element?.freight.toFixed(2).replace('.',',') || 0, disabled: false}],
        totalValue: [{value: this.data.element?.totalValue.toFixed(2).replace('.',',') || 0, disabled: true}],
        value: this.inputReadonly ? [{value: this.data.element?.value.toFixed(2).replace('.',',') || 0, disabled: true}] : [{value: this.data.element?.value.toFixed(2).replace('.',',') || 0, disabled: false}],
        travelOn: this.inputReadonly ? [{value: this.data.element?.travelOn || 0, disabled: true}] : [{value: this.data.element?.travelOn || 0, disabled: false}],
        date: this.inputReadonly ? [{value: this.data.element?.date || null,disabled: true},Validators.required] : [{value: this.data.element?.date || null, disabled: false},Validators.required],
        startTime1:this.inputReadonly ? [{value: this.data.element?.startTime.substring(11,16), disabled: true}] : [this.data.element?.startTime.substring(11,16) || null,Validators.required],
        endTime1: this.inputReadonly ? [{value: this.data.element?.endTime.substring(11,16), disabled: true}] : [this.data.element?.endTime.substring(11,16) || null,Validators.required],
        status: this.inputReadonly ? [{value: this.data.element?.status || '2', disabled: true}] : [{value: this.data.element?.status || '2', disabled: false}],
        equipamentId: this.inputReadonly ?  [{value: this.data.element?.equipamentId || null, disabled: true} ,Validators.required] : [{value: this.data.element?.equipamentId || null, disabled: false} ,Validators.required],
        temporaryName: this.inputReadonly ? [{value: this.data.element?.temporaryName, disabled: true}] : [{value: this.data.element?.temporaryName, disabled: false}],
        others: this.inputReadonly ? [{value: this.data.element?.others.toFixed(2).replace('.',',') || 0, disabled: true}] : [{value: this.data.element?.others.toFixed(2).replace('.',',') || 0, disabled: false}],
        paymentStatus: this.inputReadonly ? [{value: this.data.element?.paymentStatus, disabled: true}] : [{value: this.data.element?.paymentStatus, disabled: false}],
        paymentMethods: this.inputReadonly ? [{value: this.data.element?.paymentMethods, disabled: true}] : [{value: this.data.element?.paymentMethods, disabled: false}],
        calendarSpecifications:  this.formBuilder.array(this.data.element?.calendarSpecifications ? array : []),
        calendarEquipamentConsumables: this.formBuilder.array(this.consumableArray),
        calendarSpecificationConsumables: this.formBuilder.array(this.consumableSpecificationArray)

      });
      this.semCadastro = this.form.value.noCadastre;
      if (this.form.value.travelOn)
        this.selectedtype = this.icons.find(x => x.id == this.form.value.travelOn).icon;
      if (this.isAddMode){
      
        this.form.patchValue({
          startTime1: '08:00',
          endTime1: '18:00'
        }, { emitEvent: false });
      }
    } 

    loadConsumables(): void {
      if (this.data.element == null)
        return;

			this.createConsumableForms(this.data.element.calendarEquipamentConsumables);
		}

    loadConsumableSpecification(): void {
      if (this.data.element == null)
        return;

			this.createConsumableSpecificationForms(this.data.element.calendarSpecificationConsumables);
		}

    createConsumableForms(consumables: any[]): void {
      for (let item of consumables) {

        if (!item.active)
          continue;

        if (this.data.element != null ){
          const formGroup = this.formBuilder.group({
            id: ['', Validators.required],
            name: [{value: item.consumable.name, disabled: true}],
            active: [item.active, Validators.required],
            value: this.inputReadonly ? [{value: item.value.toFixed(2).replace('.',','), disabled: true}] : [{value: item.value.toFixed(2).replace('.',','), disabled: false}],
            equipamentId: [item.equipamentId],
            consumableId: [item.consumableId],
            calendarId: [null],
            amount: this.inputReadonly ? [{value: item.amount, disabled: true}] : [{value: item.amount, disabled: false}] ,
            totalValue: [{value: item.totalValue.toFixed(2).replace('.',','), disabled: true}],
            createdAt: new Date()
          });
      
          formGroup.addControl('id', new FormControl(item.id));
      
          this.calendarEquipamentConsumables.push(formGroup);
          continue;
        }

				const existingItem = this.data.element?.calendarEquipamentConsumables.find(e => e.consumableId === item.id);
        
				const formGroup = this.formBuilder.group({
          id: [existingItem ? existingItem.id : '', Validators.required],
					name: [{value: item.consumable.name, disabled: true}],
					active: [existingItem ? existingItem.active : item.active, Validators.required],
					value: [existingItem ? existingItem.value : item.value, Validators.required],
					equipamentId: [item.equipamentId],
					consumableId: [item.consumableId],
          calendarId: [existingItem ? this.data.element.id : null],
          amount: [existingItem ? existingItem.amount : 0],
          totalValue: [{value: existingItem ? existingItem.totalValue : 0, disabled: true}],
					createdAt: existingItem ? existingItem.createdAt : new Date()
				});
		
				if (existingItem) 
					formGroup.addControl('id', new FormControl(existingItem.id));
		
				this.calendarEquipamentConsumables.push(formGroup);
			}
		}

    createConsumableSpecificationForms(consumables: any): void {
      let specs = JSON.parse(localStorage.getItem('specificationsList'));
      
      for (let item of consumables) {
        
        if (!item.active)
          continue;

        const spec = specs.find(x => x.id === item.specificationId);

        if (!spec.hasConsumable)
          continue;

        if (this.data.element != null) {
          const formGroup = this.formBuilder.group({
            id: [ '', Validators.required],
            name: [{value: spec.name, disabled: true}],
            active: [item.active, Validators.required],
            value:  [{value: item.value.toFixed(2).replace('.',','), disabled: this.inputReadonly}],
            initial: [{value: item.initial, disabled: this.inputReadonly}],
            final: [{value: item.final, disabled: this.inputReadonly}],
            specificationId: [item.specificationId],
            calendarId: [null],
            totalValue: [{value: item.totalValue.toFixed(2).replace('.',','), disabled: true }],
            createdAt:  new Date()
          });
    
          formGroup.addControl('id', new FormControl(item.id));
      
          this.calendarSpecificationConsumables.push(formGroup);
          continue;
        } 

				const existingItem = this.data.element?.calendarSpecificationConsumables.find(e => e.consumableId === item.id);
        
				const formGroup = this.formBuilder.group({
          id: [existingItem ? existingItem.id : '', Validators.required],
					name: [{value: spec.name, disabled: true}],
					active: [existingItem ? existingItem.active : item.active, Validators.required],
					value: [existingItem ? existingItem.value : spec.value.toFixed(2).replace('.',','), Validators.required],
          initial: [existingItem ? existingItem.initial : 0],
          final: [existingItem ? existingItem.final : 0],
					specificationId: [item.specificationId],
          calendarId: [existingItem ? this.data.element.id : null],
          totalValue: [{value: existingItem ? existingItem.totalValue : 0, disabled: true}],
					createdAt: existingItem ? existingItem.createdAt : new Date()
				});
		
				if (existingItem) 
					formGroup.addControl('id', new FormControl(existingItem.id));
		
				this.calendarSpecificationConsumables.push(formGroup);
			}
		}

    get calendarEquipamentConsumables(): FormArray {
			return this.form.get('calendarEquipamentConsumables') as FormArray;
		}

    get calendarSpecificationConsumables(): FormArray {
			return this.form.get('calendarSpecificationConsumables') as FormArray;
		}

    buildCalendarSpecifications(equipamentSpecification: EquipamentSpecifications){
      return this.formBuilder.group({
        specificationId: equipamentSpecification.specificationId,
        active: equipamentSpecification.active,
        name: equipamentSpecification.name
      });
    }

    getPeople(): void {
      this.personService.loadPeople(true).subscribe((resp: Person[]) => {
        this.techniqueResult = resp.filter(x => x.personType === 'T');
        this.driverResult = resp.filter(x => x.personType === 'M');
      })
    }

    getEquipaments(): void{
      this.equipamentService.loadEquipaments(true).subscribe((resp: Equipament[]) => {
        this.equipamentResult = resp;
      })
    }

    onRoomChange(value){
      this.selectedtype = this.icons.find(x => x.id == value).icon;
    }

    getSpecifications(): void{
      this.specificationService.loadSpecifications().subscribe((resp: Specification[]) => {
        this.specificationResult = resp.filter(x => x.active === true);
      })
    }

    onChangeEquipament(event): void {
      this.calendarEquipamentConsumables.clear();
      this.calendarSpecificationConsumables.clear();

      this.arr = this.form.get('calendarSpecifications') as FormArray;
      let temp = this.equipamentResult.filter(x => x.id === event.value);

      if (this.arr.value.length !== 0)
        this.arr.clear();

      this.createConsumableForms(temp[0].equipamentConsumables)
      this.createConsumableSpecificationForms(temp[0].equipamentSpecifications)
    
      temp[0].equipamentSpecifications.forEach(item => {
        if (item.active){
          const spec = this.specificationResult.find(x => x.id === item.specificationId);
          const active = this.data.element?.equipamentSpecifications?.filter(x => x.specificationId == item.id)[0].active
          let equipamentSpecification = {
            active: (this.isAddMode ? false : active == null ? false : active ),
            specificationId: item.specificationId,
            name: spec.name
          } as EquipamentSpecifications;
          this.arr.push(this.buildCalendarSpecifications(equipamentSpecification));
        }
      });
    }

    onNoClick(): void {
      this.dialogRef.close();
    }

    onSubmit(){
      this.isVisible = false
      this.adjustFormValues();
      
      if (this.form.value.id === ""){
        this.form.value.clientId = this.form.value.client.id;
        this.calendarService.save(this.form.value).subscribe((resp: Calendar) => {
          this.toastr.success('Locação criada com sucesso.');
          this.dialogRef.close(resp);
        },
        (error: any) =>{
          this.toastr.warning(error.error?.errorMessage)
        });
      } else {
        if (this.form.value.date < this.todayDate){
          this.toastr.warning("Essa locação não pode ser alterada.")
        }
        this.calendarService.update(this.form.value).subscribe((resp: Calendar) => {
          this.toastr.success('Locação atualizada com sucesso!');
          this.dialogRef.close(resp);
        },
        (error: any) =>{
          this.toastr.warning(error.error?.errorMessage)
        }
        );
      }
    }

    adjustFormValues(){
			this.calendarEquipamentConsumables.controls.forEach((control, index) => {
				const currentValue = control.get('value').value.toString();
				const newValue  = currentValue.replace(',', '.');
        control.get('value').patchValue(newValue);
        const currentTotalValue = control.get('totalValue').value.toString();
				const newTotalValue = currentTotalValue.replace(',', '.');
        control.get('totalValue').patchValue(newTotalValue);
        control.get('totalValue').enable();
			});

      this.calendarSpecificationConsumables.controls.forEach((control, index) => {
        
				const currentValue = control.get('value').value.toString();
				const newValue  = currentValue.replace(',', '.');
        control.get('value').patchValue(newValue);
        const currentTotalValue = control.get('totalValue').value.toString();
				const newTotalValue = currentTotalValue.replace(',', '.');
        control.get('totalValue').patchValue(newTotalValue);
        control.get('totalValue').enable();

			});
      
      for (const field in this.form.controls) { // 'field' is a string
        
        if (field == "discount" || field == "freight" || field == "totalValue" || field == "value" || field == "others" ){
          const control = this.form.get(field);
          const currentValue = control.value.toString();
				  const newValue  = currentValue.replace(',', '.');
          control.patchValue(newValue);
          control.enable();
        }
        
      }
		}

    compare(dateTimeA, dateTimeB) {
      var data_locacao = moment(dateTimeA,"YYYY-MM-DD");
      var hoje = moment(dateTimeB,"YYYY-MM-DD");
      if (data_locacao > hoje) return 1;
      else if (data_locacao < hoje) return -1;
      else return 0;
    }

    padTo2Digits(num) {
      return num.toString().padStart(2, '0');
    }

    formatDate(date) {
      return [
        date.getFullYear(),
        this.padTo2Digits(date.getMonth() + 1),
        this.padTo2Digits(date.getDate()),
        ,
      ].join('-');
    }

    ajustesCSS(){
      document.getElementsByClassName("mat-form-field-outline-thick")[0].setAttribute("style","width: 95%");
      var mat_select = document.getElementsByClassName('mat-select');
      for (var i = 0; i < mat_select.length; i++) {
        mat_select[i].setAttribute('style', 'display: contents');
      }
    }

    changeValueEquipamentConsumables(i){

      const amount = this.calendarEquipamentConsumables.controls[i].get('amount').value;
      const value = this.calendarEquipamentConsumables.controls[i].get('value').value;

      if (value == "")
        return;

      const amount_ = parseFloat(amount);
      const value_ = parseFloat(value.toString().replace(',','.'))
      const totalValue = value_ * amount_;

      this.calendarEquipamentConsumables.controls[i].get('totalValue').patchValue(totalValue.toFixed(2).replace('.',','))
      this.calculateTotalValue();
    }

    changeValueSpecificationConsumables(i){

      const initial = this.calendarSpecificationConsumables.controls[i].get('initial').value;
      const final = this.calendarSpecificationConsumables.controls[i].get('final').value;
      const value = this.calendarSpecificationConsumables.controls[i].get('value').value;

      if (value == "" || initial == 0 || final == 0)
        return;
      
      const initial_ = parseFloat(initial);
      const final_ = parseFloat(final);
      const value_ = parseFloat(value.toString().replace(',','.'))
      const totalValue = (final_ - initial_) * value_;

      this.calendarSpecificationConsumables.controls[i].get('totalValue').patchValue(totalValue.toFixed(2).replace('.',','))
      this.calculateTotalValue();
    }

    onBlur(input){
      var re=/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      
      var isValid = re.test(input.target.value);
      
      var element = document.getElementById(input.target.id) as HTMLInputElement;
      
      if(!isValid)
      {
        this.toastr.warning('Horário inválido');
        element.focus();
        element.value = ""
        return false;
      }
      return true;
    }

    onBlur2(input){
      var ret = this.onBlur(input);
      
      if (ret){
      
        this.priceTableService.getValueByEquipament(this.form.value.equipamentId, this.form.value.startTime1, this.form.value.endTime1).subscribe((resp: number) => {
          
          for (const field in this.form.controls) { 
            if (field == "value" || field == "totalValue"){
              
              const control = this.form.get(field);
              const newValue  = resp.toFixed(2).replace('.', ',');
              control.patchValue(newValue);
            } 
          }
        });
      }
    }

    calculateTotalValue(){
      
      let total = 0;
      const freight =  this.form.value.freight;
      const discount = this.form.value.discount;

      this.calendarEquipamentConsumables.controls.forEach((control) => {
        const currentTotalValue = control.get('totalValue').value.toString();
				const newTotalValue = currentTotalValue.replace(',', '.');
        
        total += parseFloat(newTotalValue);
        console.log('valor equip:' + newTotalValue  );
			});

      this.calendarSpecificationConsumables.controls.forEach((control) => {
				
        const currentTotalValue = control.get('totalValue').value.toString();
				const newTotalValue = currentTotalValue.replace(',', '.');
        total += parseFloat(newTotalValue);
        console.log('valor spec:' + newTotalValue  );

			});

      const others = this.form.get('others').value;
      const others_ = parseFloat(others.toString().replace(',','.'));
      
      const value = this.form.get('value').value;
      const value_ = parseFloat(value.toString().replace(',','.'));

      const freight_ = parseFloat(freight.toString().replace(',', '.'));
      const discount_ = parseFloat(discount.toString().replace(',', '.'));

      total += value_ + freight_ - discount_ - others_;

      const control = this.form.get('totalValue');
      const newValue  = total.toString().replace('.', ',');
      control.patchValue(newValue);
    }
  }