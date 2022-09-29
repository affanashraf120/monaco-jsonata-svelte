const defaultBindingsText = `// Define bindings as properties of the below object\n// Its possible to write any javascript expression here that evaluates to an object\n{\n // name: value \n}`;

export default {
	json: {
		inputs: {
			fromDate: '2022-05-01',

			toDate: '2022-05-31'
		},

		vans: [
			{
				reg: 'ey66'
			},

			{
				reg: 'bu18'
			}
		],

		slots: [
			{
				timeRange: '09:00 to 13:00'
			},

			{
				timeRange: '13:00 to 16:00'
			},

			{
				timeRange: '16:00 to 18:00'
			}
		],

		outages: [
			{
				reason: 'Annual service',

				van: {
					reg: 'bu18'
				},

				outageDate: '2022-05-09'
			}
		]
	},
	query: `(
		$milliSecondsInDay := 86400000;     
		$dayToDate := function($day){$fromMillis($day * $milliSecondsInDay, "[Y0001]-[M01]-[D01]")};    
		$fromDay := $toMillis(inputs.fromDate) / $milliSecondsInDay;    
		$toDay := $toMillis(inputs.toDate) / $milliSecondsInDay;     
		[$fromDay..$toDay].(   
			$dateStr := $dayToDate($);    
			$vansAvailable := $count($$.vans) - $count($$.outages[outageDate=$dateStr]);    
			$slots := [1..$vansAvailable].$$.slots.timeRange;    
			{"day":$dateStr,"vansAvailable":$vansAvailable, "slots":$slots}    
		);      
	)`
};
